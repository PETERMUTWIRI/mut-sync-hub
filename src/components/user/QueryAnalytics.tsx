'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

/*  –––––––––––––––  HOOKS  –––––––––––––––  */
const useQueryHistory = () =>
  useQuery({
    queryKey: ['analytics-query-history'],
    queryFn: () => fetch('/api/analytics/query-history', { credentials: 'include' }).then((r) => r.json()),
    staleTime: 30_000,
  });

const useRunQuery = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sql: string) => {
      const res = await fetch('/api/analytics/run-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: sql }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Query failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Query executed');
      qc.invalidateQueries({ queryKey: ['analytics-query-history'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

/*  –––––––––––––––  COMPONENT  –––––––––––––––  */
export default function QueryAnalytics() {
  const [sql, setSql] = useState('');
  const { data, isLoading, error } = useQueryHistory();
  const { mutate: runQuery, isPending } = useRunQuery();

  const history = data?.queries ?? [];

  return (
    <motion.div
      className="glass-card"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card className="bg-transparent border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-inter text-gray-200">Query Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          {/*  –––––––––  RUN QUERY  –––––––––  */}
          <div className="flex mb-4">
            <Input
              placeholder="SELECT * FROM sales WHERE date > '2025-01-01';"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              disabled={isPending}
              className="bg-[#1E2A44] border-[#2E7D7D] text-gray-200 font-inter text-base focus:ring-[#2E7D7D]"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={() => runQuery(sql)}
                disabled={isPending || !sql.trim()}
                className="ml-2 bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white font-inter text-base"
              >
                Run Query
              </Button>
            </motion.div>
          </div>

          {/*  –––––––––  HISTORY TABLE  –––––––––  */}
          {isLoading ? (
            <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />
          ) : error ? (
            <div className="text-red-400 font-inter text-base">{error.message}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2E7D7D]">
                  <TableHead className="text-gray-200 font-inter text-base">Query</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Date</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Status</TableHead>
                  <TableHead className="text-gray-200 font-inter text-base">Rows</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((q: any) => (
                  <TableRow key={q.id} className="border-[#2E7D7D]">
                    <TableCell className="text-gray-300 font-inter text-base">{q.query}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{new Date(q.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{q.status}</TableCell>
                    <TableCell className="text-gray-300 font-inter text-base">{q.rowsReturned ?? '—'}</TableCell>
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