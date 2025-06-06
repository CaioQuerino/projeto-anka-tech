import fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const app = fastify()
const prisma = new PrismaClient()

// CORS
app.register(fastifyCors, {
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})

// Schemas
const createClientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  status: z.enum(['active', 'inactive'])
})


const assetSchema = z.object({
  name: z.string().min(2, "Nome do ativo deve ter pelo menos 2 caracteres"),
  value: z.number().positive("Valor deve ser positivo"),
  clientId: z.number().int().positive("ID do cliente inválido")
})

// Rotas de Cliente

// Criar cliente
app.post('/api/clients', async (request, reply) => {
  try {
    const { name, email, status } = createClientSchema.parse(request.body)

    const existingClient = await prisma.client.findUnique({ where: { email } })
    if (existingClient) {
      return reply.status(400).send({ error: "Email já cadastrado" })
    }

    const client = await prisma.client.create({
      data: { name, email, status }
    })

    return reply.status(201).send(client)
  } catch (error) {
    console.error("Erro no cadastro:", error)
    return reply.status(500).send({ error: "Erro ao cadastrar cliente" })
  }
})

// Listar clientes com paginação e filtros
app.get('/api/clients', async (request, reply) => {
  try {
    const queryParams = z.object({
      status: z.enum(['active', 'inactive']).optional(),
      search: z.string().optional(),
      page: z.coerce.number().int().positive().optional().default(1),
      limit: z.coerce.number().int().positive().max(100).optional().default(10)
    }).parse(request.query)

    const where = {
      AND: [
        queryParams.status ? { status: queryParams.status } : {},
        queryParams.search ? {
          OR: [
            { name: { contains: queryParams.search, mode: 'insensitive' } },
            { email: { contains: queryParams.search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip: (queryParams.page - 1) * queryParams.limit,
        take: queryParams.limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where })
    ])

    const totalPages = Math.ceil(total / queryParams.limit)

    return reply.send({
      data: clients,
      meta: {
        total,
        totalPages,
        currentPage: queryParams.page,
        perPage: queryParams.limit,
        hasNextPage: queryParams.page < totalPages
      }
    })
  } catch (error) {
    console.error('Erro ao listar clientes:', error)
    return reply.status(500).send({
      error: 'Erro ao buscar clientes',
      details: error instanceof Error ? error.message : undefined
    })
  }
})

// Buscar cliente por ID
app.get('/api/clients/:id', async (request, reply) => {
  try {
    const { id } = z.object({ id: z.coerce.number() }).parse(request.params)

    const client = await prisma.client.findUnique({ where: { id } })

    if (!client) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    return reply.send(client)
  } catch (error) {
    console.error('Erro ao buscar cliente:', error)
    return reply.status(400).send({ error: 'Erro ao buscar cliente' })
  }
})

// Atualizar cliente
app.put('/api/clients/:id', async (request, reply) => {
  try {
    const { id } = z.object({ id: z.coerce.number() }).parse(request.params)
    const updateData = createClientSchema.partial().parse(request.body)

    const updatedClient = await prisma.client.update({
      where: { id },
      data: updateData
    })

    return reply.send(updatedClient)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return reply.status(400).send({ error: 'Erro ao atualizar cliente' })
  }
})

// Deletar cliente
// Remover cliente por ID
app.delete('/api/clients/:id', async (request, reply) => {
  const params = z.object({
    id: z.coerce.number().int().positive()
  }).parse(request.params)

  try {
    // Verifica se o cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    // Remove os assets relacionados primeiro, se necessário (se FK não for "onDelete: cascade")
    await prisma.asset.deleteMany({
      where: { clientId: params.id }
    })

    // Depois remove o cliente
    await prisma.client.delete({
      where: { id: params.id }
    })

    return reply.status(204).send() // No Content
  } catch (error) {
    console.error('Erro ao remover cliente:', error)
    return reply.status(500).send({ error: 'Erro ao remover cliente' })
  }
})

  app.get('/api/assets/all', async (request, reply) => {
    try {
      const assets = await prisma.asset.findMany({
        include: {
          client: true,
        },
      })

      return reply.send({ assets })
    } catch (error) {
      console.error('Erro ao buscar ativos:', error)
      return reply.status(500).send({ error: 'Erro ao buscar ativos' })
    }
  })
  
  // Listar assets do cliente
app.get('/api/clients/:clientId/assets', async (request, reply) => {
  try {
    const { clientId } = z.object({ clientId: z.coerce.number() }).parse(request.params)

    // Opcional: checar se cliente existe (pode omitir)
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } })
    if (!clientExists) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    const assets = await prisma.asset.findMany({
      where: { clientId }
    })

    return reply.send({ assets })
  } catch (error) {
    console.error('Erro ao buscar ativos do cliente:', error)
    return reply.status(500).send({ error: 'Erro ao buscar ativos' })
  }
})

// Criar ativo
app.post('/api/assets', async (request, reply) => {
  try {
    const { name, value, clientId } = assetSchema.parse(request.body)

    // Verifica se o cliente existe
    const clientExists = await prisma.client.findUnique({ where: { id: clientId } })
    if (!clientExists) {
      return reply.status(404).send({ error: 'Cliente não encontrado' })
    }

    const asset = await prisma.asset.create({
      data: {
        name,
        value,
        clientId
      }
    })

    return reply.status(201).send(asset)
  } catch (error) {
    console.error('Erro ao criar ativo:', error)
    return reply.status(400).send({ error: 'Erro ao criar ativo' })
  }
})



// Iniciar servidor
app.listen({ port: 3333, host: '0.0.0.0' }, () => {
  console.log('🚀 Servidor rodando em http://localhost:3333')
})
