export class ConnectorHttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly responseBody: unknown,
  ) {
    super(message)
    this.name = 'ConnectorHttpError'
  }
}

export class ConnectorHttpClient {
  async get<TResponse>(
    port: number,
    path: string,
    token?: string,
  ): Promise<TResponse> {
    const response = await fetch(this.buildUrl(port, path), {
      method: 'GET',
      headers: this.buildHeaders(token),
    })

    return await this.handleResponse<TResponse>(response)
  }

  private async handleEmptyResponse(response: Response): Promise<void> {
  if (response.ok) {
    return
  }

  const responseBody = await this.tryReadResponseBody(response)
  const message = this.extractErrorMessage(responseBody) ?? `Pedido falhou com o estado ${response.status}.`

  throw new ConnectorHttpError(
    response.status,
    message,
    responseBody,
  )
}

  async delete(
  port: number,
  path: string,
  token?: string,
): Promise<void> {
  const response = await fetch(this.buildUrl(port, path), {
    method: 'DELETE',
    headers: this.buildHeaders(token),
  })

  await this.handleEmptyResponse(response)
}

  async post<TRequest, TResponse>(
    port: number,
    path: string,
    body: TRequest,
    token?: string,
  ): Promise<TResponse> {
    const response = await fetch(this.buildUrl(port, path), {
      method: 'POST',
      headers: this.buildHeaders(token),
      body: JSON.stringify(body),
    })

    return await this.handleResponse<TResponse>(response)
  }

  private buildUrl(port: number, path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`

    return `https://localhost:${port}${normalizedPath}`
  }

  private buildHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['X-Connector-Token'] = token
    }

    return headers
  }

  private async handleResponse<TResponse>(response: Response): Promise<TResponse> {
    if (response.ok) {
      return await response.json() as TResponse
    }

    const responseBody = await this.tryReadResponseBody(response)
    const message = this.extractErrorMessage(responseBody) ?? `Pedido falhou com o estado ${response.status}.`

    throw new ConnectorHttpError(
      response.status,
      message,
      responseBody,
    )
  }

  private async tryReadResponseBody(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? ''

    try {
      if (contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch {
      return null
    }
  }

  

  private extractErrorMessage(responseBody: unknown): string | null {
    if (!responseBody || typeof responseBody !== 'object') {
      return null
    }

    const body = responseBody as Record<string, unknown>

    if (typeof body.message === 'string') {
      return body.message
    }

    if (typeof body.error === 'string') {
      return body.error
    }

    if (typeof body.title === 'string') {
      return body.title
    }

    return null
  }
}