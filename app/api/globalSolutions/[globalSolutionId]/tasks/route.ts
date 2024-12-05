import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { globalSolutionId: string } }
) {
  try {
    const tasks = await prisma.globalTask.findMany({
      where: {
        globalSolutionTasks: {
          some: {
            globalSolutionId: params.globalSolutionId
          }
        }
      },
      include: {
        childTasks: {
          include: {
            child: {
              include: {
                childTasks: {
                  include: {
                    child: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
