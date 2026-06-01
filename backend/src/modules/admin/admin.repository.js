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

export const createPublicUpdateAndLog = async (updateData, logData) => {
  const [pubUpdate] = await prisma.$transaction([
    prisma.publicUpdate.create({
      data: updateData,
    }),
    prisma.complaint.update({
      where: {
        id: updateData.complaintId,
      },
      data: {
        adminNote: updateData.message,
      },
    }),
    prisma.complaintLog.create({
      data: logData,
    }),
  ])

  return pubUpdate
}

export const createInternalNoteAndLog = async (noteData, logData) => {
  const [intNote] = await prisma.$transaction([
    prisma.internalNote.create({
      data: noteData,
    }),
    prisma.complaintLog.create({
      data: logData,
    }),
  ])

  return intNote
}

export const findUserById = (id) =>
  prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailInstantAlerts: true,
      emailDailyDigest: true,
      isSuperAdmin: true,
    },
  })

export const updateUser = (id, data) =>
  prisma.user.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailInstantAlerts: true,
      emailDailyDigest: true,
      isSuperAdmin: true,
    },
  })

export const getSystemPreference = (key) =>
  prisma.systemPreference.findUnique({
    where: {
      key,
    },
  })

export const upsertSystemPreference = (key, value) =>
  prisma.systemPreference.upsert({
    where: {
      key,
    },
    update: {
      value,
    },
    create: {
      key,
      value,
    },
  })
