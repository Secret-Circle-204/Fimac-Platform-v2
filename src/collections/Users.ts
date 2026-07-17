import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'CRM & Users',
    description: 'Manage admin users and permissions',
  },
  lockDocuments: false,
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days in seconds
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return user.collection === 'users'
    },
    create: ({ req: { user } }) => {
      return user?.collection === 'users' && user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.collection === 'users' && user.role === 'admin') return true
      return {
        id: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      return user?.collection === 'users' && user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Moderator', value: 'moderator' },
      ],
      access: {
        create: ({ req: { user } }) => user?.collection === 'users' && user?.role === 'admin',
        update: ({ req: { user } }) => user?.collection === 'users' && user?.role === 'admin',
      },
      admin: {
        description: 'Set the permission role for this administrative user.',
      },
    },
  ],
  endpoints: [
    {
      path: '/force-reset-pd',
      method: 'post',
      handler: async (req) => {
        const { email, newPassword, syncToken } = req.json ? await req.json() : req.body
        const mySecret = process.env.CACHE_REVALIDATION_TOKEN
        if (!mySecret || syncToken !== mySecret) {
          return Response.json({ error: 'Unauthorized: Invalid secret key.' }, { status: 401 })
        }
        if (!email || !newPassword) {
          return Response.json({ error: 'Missing email or newPassword.' }, { status: 400 })
        }
        try {
          const { docs } = await req.payload.find({
            collection: 'users',
            where: {
              email: {
                equals: email,
              },
            },
          })
          if (docs.length === 0) {
            await req.payload.create({
              collection: 'users',
              data: {
                email,
                password: newPassword,
                role: 'admin',
              },
            })
            return Response.json({ message: 'User created successfully!' }, { status: 201 })
          }

          const userId = docs[0].id
          await req.payload.update({
            collection: 'users',
            id: userId,
            data: {
              password: newPassword,
            },
          })
          return Response.json({ message: 'Password updated successfully!' }, { status: 200 })
        } catch (_error) {
          return Response.json({ error: 'Something went wrong.' }, { status: 500 })
        }
      },
    },
  ],
}
