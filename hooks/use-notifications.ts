'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { markNotificationReadAction } from '@/lib/actions/notification-actions';
import type { ApiResponse, Notification } from '@/types';

interface NotificationsData {
  items: Notification[];
  unreadCount: number;
}

/**
 * 알림 목록 조회 훅
 *
 * 사용자의 알림 목록과 읽지 않은 알림 수를 API에서 조회한다.
 * 1분 간격으로 자동 재요청하여 실시간에 가까운 알림을 제공한다.
 */
export function useNotifications() {
  return useQuery<NotificationsData>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch('/api/notifications');
      const json: ApiResponse<NotificationsData> = await response.json();

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data!;
    },
    refetchInterval: 60_000,
  });
}

/**
 * 알림 읽음 처리 뮤테이션 훅
 *
 * markNotificationReadAction 서버 액션을 래핑하고,
 * 성공 시 알림 쿼리 캐시를 무효화한다.
 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const result = await markNotificationReadAction(notificationId);

      if (!result.success) {
        throw new Error(result.error ?? '알림 처리에 실패했습니다.');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
