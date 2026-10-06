'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/ui/spinner';
import { useAuth } from '@/store/auth';
import { canAssignTraining } from '@/lib/roles';
import { assignmentsApi, coursesApi } from '@/lib/api';
import type { CourseListItem, TrainingAssignment, TrainingReport } from '@/types/api';

export default function TrainingPage() {
  const t = useTranslations('app.training');
  const { user } = useAuth();
  const allowed = canAssignTraining(user);
  const needsScopeIds = user?.role === 'SUPER_ADMIN' || user?.role === 'PORTAL_ADMIN' || user?.role === 'ACME_CREATOR';

  const [assignments, setAssignments] = useState<TrainingAssignment[] | null>(null);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [courseId, setCourseId] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [districtId, setDistrictId] = useState(user?.districtId || '');
  const [schoolId, setSchoolId] = useState(user?.schoolId || '');
  const [saving, setSaving] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [report, setReport] = useState<TrainingReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!allowed) {
      setAssignments([]);
      return;
    }
    assignmentsApi.list().then((d) => setAssignments(d.assignments)).catch(() => setAssignments([]));
    coursesApi.list({ limit: 100, status: 'PUBLISHED' }).then((d) => {
      setCourses(d.courses);
      if (d.courses[0]) setCourseId(d.courses[0]._id);
    }).catch(() => setCourses([]));
  }, [allowed]);

  const loadReport = async (id: string) => {
    setReportId(id);
    setReportLoading(true);
    try {
      setReport(await assignmentsApi.report(id));
    } catch {
      toast.error(t('reportError'));
      setReport(null);
    } finally {
      setReportLoading(false);
    }
  };

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    setSaving(true);
    try {
      await assignmentsApi.create({
        courseId,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        districtId: needsScopeIds ? districtId || null : undefined,
        schoolId: needsScopeIds ? schoolId || null : undefined,
      });
      toast.success(t('created'));
      const d = await assignmentsApi.list();
      setAssignments(d.assignments);
    } catch {
      toast.error(t('createError'));
    } finally {
      setSaving(false);
    }
  };

  if (!allowed) {
    return <p className="text-sm text-gray-500">{t('forbidden')}</p>;
  }

  if (assignments === null) return <PageSpinner />;

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-sm text-gray-500">{t('description')}</p>

      <form onSubmit={onCreate} className="max-w-xl space-y-4 rounded-2xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="font-heading text-base font-medium">{t('assignTitle')}</h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="training-course" className="text-sm font-medium">{t('course')}</label>
          <select
            id="training-course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            required
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <Input
          id="training-due"
          label={t('dueAt')}
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
        {needsScopeIds && (
          <>
            <Input label={t('districtId')} value={districtId} onChange={(e) => setDistrictId(e.target.value)} />
            <Input label={t('schoolId')} value={schoolId} onChange={(e) => setSchoolId(e.target.value)} />
          </>
        )}
        <Button type="submit" disabled={saving || !courseId}>
          {saving ? t('assigning') : t('assign')}
        </Button>
      </form>

      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('existing')}</h2>
        {assignments.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">{t('empty')}</p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {assignments.map((row) => (
              <button key={row.id} type="button" onClick={() => void loadReport(row.id)} className="text-left">
                <Card className={row.id === reportId ? 'ring-2 ring-brand-400' : ''}>
                  <CardHeader>
                    <CardTitle>{row.course?.title || t('course')}</CardTitle>
                    <CardDescription>
                      {row.dueAt ? `${t('dueAt')}: ${new Date(row.dueAt).toLocaleDateString()}` : t('noDue')}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>

      {reportLoading && <PageSpinner />}
      {report && !reportLoading && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            {t('reportTitle', { title: report.assignment.course?.title || t('course') })}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('summary', {
              completed: report.summary.completed,
              assigned: report.summary.assigned,
              percent: report.summary.percentComplete,
            })}
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-800">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-2 font-semibold">{t('colName')}</th>
                  <th className="px-4 py-2 font-semibold">{t('colRole')}</th>
                  <th className="px-4 py-2 font-semibold">{t('colStatus')}</th>
                  <th className="px-4 py-2 font-semibold">{t('colProgress')}</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.userId} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">{row.name}</td>
                    <td className="px-4 py-2 text-gray-500">{row.role}</td>
                    <td className="px-4 py-2">
                      <Badge variant={row.status === 'COMPLETED' ? 'completed' : row.status === 'ACTIVE' ? 'active' : 'outline'}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-gray-500">{row.progressPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
