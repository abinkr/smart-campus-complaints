import { prisma } from '../../config/prisma.js'
import { getPrismaSkipTake } from '../../utils/paginate.js'

const COMPLAINT_SUMMARY_SELECT = {
  id: true,
  title: true,
  category: true,
  priority: true,
  status: true,
  department: true,
  createdAt: true,
  updatedAt: true,
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

export const createComplaint = (data) =>
  prisma.complaint.create({
    data,
  })

export const findComplaintsByUser = async (userId, { status, page, limit }) => {
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
        orderBy: {
          changedAt: 'desc',
        },
        take: 50,
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
