'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Clock, Plus } from 'lucide-react';

/*  –––––––––––––––  HOOKS  –––––––––––––––  */
const useSchedules = () =>
  useQuery({
    queryKey: ['analytics-schedules'],
    queryFn: () => fetch('/api/analytics/schedule', { credentials: 'include' }).then((r) => r.json()),
    staleTime: 60_000,
  });

const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cron: string) => {
      const res = await fetch('/api/analytics/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cron }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Create failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Schedule created');
      qc.invalidateQueries({ queryKey: ['analytics-schedules'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/*  –––––––––––––––  COMPONENT  –––––––––––––––  */
export default function ScheduleAnalytics() {
  const [cron, setCron] = useState('0 8 * * MON'); // Monday 08:00 default
  const { data, isLoading, error } = useSchedules();
  const { mutate: create, isPending } = useCreateSchedule();
  const schedules = data?.schedules ?? [];

  return (
    <motion.div
      className="glass-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-inter text-gray-200">Schedule Analytics</CardTitle>
          <Button
            size="sm"
            onClick={() => create(cron)}
            disabled={isPending}
            className="bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
          >
            <Plus className="w-4 h-4 mr-2" /> New Schedule
          </Button>
        </CardHeader>
        <CardContent>
          {/*  –––––––––  CREATE FORM  –––––––––  */}
          <div className="flex mb-4">
            <Input
              placeholder="Cron expression: 0 8 * * MON"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200 font-inter text-base focus:ring-[#2E7D7D]"
            />
          </div>

          {/*  –––––––––  SCHEDULE TABLE  –––––––––  */}
          {isLoading ? (
            <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
          ) : error ? (
            <div className="text-red-400 font-inter text-base">{error.message}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2E7D7D]">
                  <TableHead className="text-gray-200 font-inter text-base">Frequency</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Next Run</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">
                    <Clock className="w-4 h-4" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((s: any) => (
                  <TableRow key={s.id} className="border-[#2E7D7D]">
                    <TableCell className="text-gray-300 font-inter text-base">{s.frequency}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{new Date(s.nextRun).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">
                      <Clock className="w-4 h-4" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}