'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/common/EmptyState'

interface NotificationItem {
  id: string
  title: string
  body: string | null
  type: string
  readAt: string | null
  createdAt: string
}

interface PageData {
  data: {
    items: NotificationItem[]
    nextCursor: string | null
    unreadCount: number
  }
}

type Filter = 'all' | 'unread'

export function NotificationsPageClient() {
  const [filter, setFilter] = useState<Filter>('all')
  const queryClient = useQueryClient()
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery<PageData>({
      queryKey: ['notifications', 'page', filter],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams()
        if (filter === 'unread') params.set('filter', 'unread')
        if (pageParam) params.set('cursor', pageParam as string)
        const res = await fetch(`/api/notifications?${params}`)
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (last) => last.data.nextCursor ?? undefined,
    })

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  // Mark all as read when landing on the page
  useEffect(() => {
    markAllRead.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Infinite scroll via IntersectionObserver
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  const allItems = data?.pages.flatMap((p) => p.data.items) ?? []
  const unreadCount = data?.pages[0]?.data.unreadCount ?? 0

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : allItems.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8" />}
          title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          description={
            filter === 'unread'
              ? "You're all caught up!"
              : 'Notifications will appear here when there is activity in your workspace.'
          }
        />
      ) : (
        <div className="rounded-lg border divide-y divide-border overflow-hidden">
          {allItems.map((n) => (
            <div
              key={n.id}
              className={cn(
                'px-5 py-4 text-sm',
                !n.readAt && 'bg-primary/5'
              )}
            >
              <div className="flex items-start gap-3">
                {!n.readAt && (
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
                <div className={cn('flex-1 min-w-0', n.readAt && 'pl-4')}>
                  <p className={cn('font-medium leading-snug', n.readAt ? 'text-muted-foreground' : 'text-foreground')}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll loader sentinel */}
      <div ref={loaderRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="space-y-2 py-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationsSkeleton() {
  return (
    <div className="rounded-lg border divide-y divide-border overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-start gap-3">
          <div className="flex-1 space-y-2 py-0.5">
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
