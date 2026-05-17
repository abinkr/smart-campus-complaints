import { prisma } from '../../config/prisma.js'
import { getPrismaSkipTake } from '../../utils/paginate.js'

const buildWhereClause = ({ category, priority, status, department, search } = {}) => {
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
      {
        user: {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      },
    ]
  }

  return where
}

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
}

export const findComplaints = async (filters, { page, limit }) => {
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
          select: USER_SELECT,
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

export const findComplaintForUpdate = (id) =>
  prisma.complaint.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  })

export const updateComplaintAndLog = async (id, updateData, logData) => {
  const [updated] = await prisma.$transaction([
    prisma.complaint.update({
      where: {
        id,
      },
      data: updateData,
    }),
    prisma.complaintLog.create({
      data: logData,
    }),
  ])

  return updated
}

export const findComplaintsForExport = (filters) =>
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
