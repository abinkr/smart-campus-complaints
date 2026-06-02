import { Prisma } from '@prisma/client'
import { prisma } from '../../config/prisma.js'
import { getPrismaSkipTake } from '../../utils/paginate.js'

const COMPLAINT_SUMMARY_SELECT = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  category: true,
  priority: true,
  nlpConfidence: true,
  status: true,
  department: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
}

export const buildWhereClause = ({ category, priority, status, department, search } = {}) => {
  const where = {}

  if (category) {
    where.category = category
  }

  if (priority) {
    where.priority = priority
  }

  if (status) {
    where.status = status
  }

  if (department) {
    where.department = department
  }

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: search,
          mode: 'insensitive',
        },
      },
    ]
  }

  return where
}

const buildStudentSearchFilter = (search) => {
  if (!search) {
    return Prisma.empty
  }

  const pattern = `%${search}%`
  return Prisma.sql`
    AND (
      c.id::text ILIKE ${pattern}
      OR c.title ILIKE ${pattern}
      OR c.description ILIKE ${pattern}
      OR COALESCE(c.category, '') ILIKE ${pattern}
    )
  `
}

const buildStudentStatusFilter = (status) => {
  if (!status) {
    return Prisma.empty
  }

  return Prisma.sql`AND c.status::text = ${status}`
}

const findComplaintsByUserSearch = async (userId, { status, search, page, limit }) => {
  const skip = (page - 1) * limit
  const statusFilter = buildStudentStatusFilter(status)
  const searchFilter = buildStudentSearchFilter(search)

  const [data, countRows] = await Promise.all([
    prisma.$queryRaw(Prisma.sql`
      SELECT
        c.id::text AS id,
        c.user_id::text AS "userId",
        c.title,
        c.description,
        c.image_url AS "imageUrl",
        c.category,
        c.priority::text AS priority,
        c.nlp_confidence AS "nlpConfidence",
        c.status::text AS status,
        c.department,
        c.created_at AS "createdAt",
        c.updated_at AS "updatedAt",
        c.resolved_at AS "resolvedAt"
      FROM complaints c
      WHERE c.user_id = ${userId}::uuid
      ${statusFilter}
      ${searchFilter}
      ORDER BY c.created_at DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `),
    prisma.$queryRaw(Prisma.sql`
      SELECT COUNT(*)::int AS count
      FROM complaints c
      WHERE c.user_id = ${userId}::uuid
      ${statusFilter}
      ${searchFilter}
    `),
  ])

  return {
    data,
    total: Number(countRows[0]?.count ?? 0),
  }
}

export const createComplaint = (data) =>
  prisma.complaint.create({
    data,
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

export const findComplaintsByUser = async (userId, { status, search, page, limit }) => {
  if (search) {
    return findComplaintsByUserSearch(userId, { status, search, page, limit })
  }

  const where = {
    userId,
    ...(status && {
      status,
    }),
  }

  const [data, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      ...getPrismaSkipTake({ page, limit }),
      select: COMPLAINT_SUMMARY_SELECT,
    }),
    prisma.complaint.count({
      where,
    }),
  ])

  return {
    data,
    total,
  }
}

export const findComplaintById = (id) =>
  prisma.complaint.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      logs: {
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          changedAt: 'desc',
        },
        take: 50,
      },
      publicUpdates: {
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      internalNotes: {
        include: {
          admin: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      studentFollowUps: {
        include: {
          student: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

export const findAllComplaints = async (filters, { page, limit }) => {
  const where = buildWhereClause(filters)

  const [data, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      ...getPrismaSkipTake({ page, limit }),
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.complaint.count({
      where,
    }),
  ])

  return {
    data,
    total,
  }
}

export const findAllComplaintsForExport = (filters) =>
  prisma.complaint.findMany({
    where: buildWhereClause(filters),
    orderBy: {
      createdAt: 'desc',
    },
    take: 10000,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

export const updateComplaint = (id, data) =>
  prisma.complaint.update({
    where: {
      id,
    },
    data,
  })

export const createComplaintLog = (data) =>
  prisma.complaintLog.create({
    data,
  })

export const createFollowUpAndLog = async (followUpData, logData) => {
  const [followUp] = await prisma.$transaction([
    prisma.studentFollowUp.create({
      data: followUpData,
    }),
    prisma.complaint.update({
      where: {
        id: followUpData.complaintId,
      },
      data: {
        status: 'OPEN',
      },
    }),
    prisma.complaintLog.create({
      data: logData,
    }),
  ])

  return followUp
}
