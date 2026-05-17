export class ApiResponse {
  static send(res, { statusCode = 200, message = 'Success', data = null, meta = null }) {
    const body = {
      success: true,
      message,
    }

    if (data !== null) {
      body.data = data
    }

    if (meta !== null) {
      body.meta = meta
    }

    return res.status(statusCode).json(body)
  }

  static ok(res, data, message = 'Success', meta = null) {
    return ApiResponse.send(res, {
      statusCode: 200,
      message,
      data,
      meta,
    })
  }

  static created(res, data, message = 'Created') {
    return ApiResponse.send(res, {
      statusCode: 201,
      message,
      data,
    })
  }

  static noContent(res) {
    return res.status(204).end()
  }

  static paginated(res, data, { page, limit, total }) {
    return ApiResponse.send(res, {
      statusCode: 200,
      message: 'Success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    })
  }
}
