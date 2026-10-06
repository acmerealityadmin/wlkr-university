'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Plus, Trash2, UserRound } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSpinner } from '@/components/ui/spinner';
import { authApi, universityProfileApi } from '@/lib/api';
import { UNIVERSITY_FORMATS, UNIVERSITY_TOPICS, toggleId } from '@/lib/university-profile';
import { cn, getInitials } from '@/lib/utils';
import { useAuth } from '@/store/auth';
import type { UniversityAdditionalEmail, UniversityFormatId, UniversityProfile, UniversityTopicId, User } from '@/types/api';

function emptyEmail(): UniversityAdditionalEmail {
  return { email: '', label: '', notify: true };
}

function CheckRow({
  checked,
  onChange,
  children,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <label className={cn('flex items-start gap-2.5 text-sm text-gray-800 dark:text-gray-200', disabled && 'opacity-50')}>
      <input
        type="checkbox"
        className="mt-0.5 accent-brand-600"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

function withUserId(user: User): User {
  const id = String(user._id || user.id || '');
  return { ...user, _id: id, id: user.id || id };
}

export default function ProfilePage() {
  const t = useTranslations('app.profile');
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [locale, setLocale] = useState('en');
  const [locales, setLocales] = useState<{ code: string; name: string }[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [additionalEmails, setAdditionalEmails] = useState<UniversityAdditionalEmail[]>([]);
  const [topics, setTopics] = useState<UniversityTopicId[]>([]);
  const [formats, setFormats] = useState<UniversityFormatId[]>([]);
  const [notifyTopics, setNotifyTopics] = useState<UniversityTopicId[]>([]);
  const [notifyFormats, setNotifyFormats] = useState<UniversityFormatId[]>([]);
  const [push, setPush] = useState(false);
  const [sms, setSms] = useState(false);
  const [emailChannel, setEmailChannel] = useState(false);
  const [notifyPrimaryEmail, setNotifyPrimaryEmail] = useState(true);
  const [otherNotes, setOtherNotes] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [primaryEmail, setPrimaryEmail] = useState('');

  const applyLearningUser = (next: User) => {
    setFirstName(next.firstName || '');
    setLastName(next.lastName || '');
    setUsername(next.username || '');
    setPrimaryEmail(next.email || '');
    setLocale(next.locale || 'en');
    setAvatarUrl(next.avatarUrl || '');
    setHasPassword(Boolean(next.hasPassword));
  };

  const applyUniversityProfile = (profile: UniversityProfile) => {
    setPhone(profile.phone || '');
    setAdditionalEmails(profile.additionalEmails.length ? profile.additionalEmails : []);
    setTopics(profile.topics);
    setFormats(profile.formats);
    setNotifyTopics(profile.notifyTopics);
    setNotifyFormats(profile.notifyFormats);
    setPush(profile.channels.push);
    setSms(profile.channels.sms);
    setEmailChannel(profile.channels.email);
    setNotifyPrimaryEmail(profile.notifyPrimaryEmail);
    setOtherNotes(profile.otherNotes || '');
  };

  useEffect(() => {
    if (user) applyLearningUser(user);
    Promise.all([
      universityProfileApi.get(),
      authApi.locales().catch(() => ({ locales: [{ code: 'en', name: 'English' }] })),
    ])
      .then(([data, loc]) => {
        const next = withUserId(data.user);
        setUser(next);
        applyLearningUser(next);
        applyUniversityProfile(data.profile);
        setLocales(loc.locales?.length ? loc.locales : [{ code: 'en', name: 'English' }]);
      })
      .catch(() => toast.error(t('loadError')))
      .finally(() => setLoading(false));
    // Session user is only used to paint fields immediately; the GET is the source of truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, t]);

  const setTopic = (id: UniversityTopicId, on: boolean) => {
    setTopics((list) => toggleId(list, id, on));
    if (!on) setNotifyTopics((list) => toggleId(list, id, false));
  };

  const setFormat = (id: UniversityFormatId, on: boolean) => {
    setFormats((list) => toggleId(list, id, on));
    if (!on) setNotifyFormats((list) => toggleId(list, id, false));
  };

  const updateEmail = (index: number, patch: Partial<UniversityAdditionalEmail>) => {
    setAdditionalEmails((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error(t('usernameRequired'));
      return;
    }
    const changingPassword = Boolean(newPassword || confirmPassword || currentPassword);
    if (changingPassword) {
      if (!currentPassword) {
        toast.error(t('currentPasswordRequired'));
        return;
      }
      if (newPassword.trim().length < 8) {
        toast.error(t('passwordLength'));
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(t('passwordMismatch'));
        return;
      }
    }
    setSaving(true);
    try {
      const data = await universityProfileApi.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        locale,
        ...(changingPassword ? { currentPassword, newPassword: newPassword.trim() } : {}),
        phone,
        additionalEmails: additionalEmails.filter((row) => row.email.trim()),
        topics,
        formats,
        notifyTopics,
        notifyFormats,
        channels: { push, sms, email: emailChannel },
        notifyPrimaryEmail,
        otherNotes,
      });
      const next = withUserId(data.user);
      setUser(next);
      applyLearningUser(next);
      applyUniversityProfile(data.profile);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(changingPassword ? t('savedPassword') : t('saved'));
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSpinner />;

  return (
    <form onSubmit={onSave} className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5 text-brand-600" />
            {t('personalTitle')}
          </CardTitle>
          <CardDescription>{t('personalDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/40">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white">
                {getInitials([firstName, lastName].filter(Boolean).join(' ') || username || primaryEmail)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {[firstName, lastName].filter(Boolean).join(' ') || username || primaryEmail}
              </p>
              <p className="truncate text-xs text-gray-500">{primaryEmail}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label={t('firstName')} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label={t('lastName')} value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label={t('username')} value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label={t('primaryEmail')} value={primaryEmail} disabled />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="learning-locale" className="text-sm font-medium text-foreground">
              {t('locale')}
            </label>
            <select
              id="learning-locale"
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="h-10 rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {(locales.length ? locales : [{ code: locale || 'en', name: locale || 'English' }]).map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">{t('primaryEmailHint')}</p>
          {!hasPassword && <p className="text-xs text-gray-500">{t('ssoHint')}</p>}

          {hasPassword && (
            <div className="space-y-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('passwordTitle')}</p>
              <Input
                label={t('currentPassword')}
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('newPassword')}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  label={t('confirmPassword')}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('contactTitle')}</CardTitle>
          <CardDescription>{t('contactDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label={t('phone')}
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('phonePlaceholder')}
          />
          <div>
            <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">{t('extraEmails')}</p>
            <CheckRow checked={notifyPrimaryEmail} onChange={setNotifyPrimaryEmail}>
              {t('notifyPrimary', { email: primaryEmail })}
            </CheckRow>
            <div className="mt-3 space-y-3">
              {additionalEmails.map((row, index) => (
                <div key={index} className="grid gap-2 rounded-xl border border-gray-100 p-3 dark:border-gray-800 sm:grid-cols-[1fr_8rem_auto_auto] sm:items-end">
                  <Input
                    label={t('extraEmail')}
                    type="email"
                    value={row.email}
                    onChange={(e) => updateEmail(index, { email: e.target.value })}
                  />
                  <Input
                    label={t('emailLabel')}
                    value={row.label}
                    onChange={(e) => updateEmail(index, { label: e.target.value })}
                    placeholder={t('emailLabelPlaceholder')}
                  />
                  <label className="mb-2 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      className="accent-brand-600"
                      checked={row.notify}
                      onChange={(e) => updateEmail(index, { notify: e.target.checked })}
                    />
                    {t('notifyHere')}
                  </label>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setAdditionalEmails((rows) => rows.filter((_, i) => i !== index))} aria-label={t('removeEmail')}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {additionalEmails.length < 5 && (
              <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setAdditionalEmails((rows) => [...rows, emptyEmail()])}>
                <Plus className="h-4 w-4" />
                {t('addEmail')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('interestsTitle')}</CardTitle>
          <CardDescription>{t('interestsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t('topicsTitle')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {UNIVERSITY_TOPICS.map((id) => {
                const interested = topics.includes(id);
                return (
                  <div key={id} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <CheckRow checked={interested} onChange={(on) => setTopic(id, on)}>
                      {t(`topics.${id}`)}
                    </CheckRow>
                    <div className="mt-2 pl-6">
                      <CheckRow
                        checked={notifyTopics.includes(id)}
                        disabled={!interested}
                        onChange={(on) => setNotifyTopics((list) => toggleId(list, id, on))}
                      >
                        {t('notifyAboutThis')}
                      </CheckRow>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">{t('formatsTitle')}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {UNIVERSITY_FORMATS.map((id) => {
                const interested = formats.includes(id);
                return (
                  <div key={id} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <CheckRow checked={interested} onChange={(on) => setFormat(id, on)}>
                      {t(`formats.${id}`)}
                    </CheckRow>
                    <div className="mt-2 pl-6">
                      <CheckRow
                        checked={notifyFormats.includes(id)}
                        disabled={!interested}
                        onChange={(on) => setNotifyFormats((list) => toggleId(list, id, on))}
                      >
                        {t('notifyAboutThis')}
                      </CheckRow>
                    </div>
                  </div>
                );
              })}
            </div>
            {formats.includes('other') && (
              <div className="mt-3">
                <Input
                  label={t('otherNotes')}
                  value={otherNotes}
                  onChange={(e) => setOtherNotes(e.target.value)}
                  placeholder={t('otherNotesPlaceholder')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('channelsTitle')}</CardTitle>
          <CardDescription>{t('channelsDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <CheckRow checked={push} onChange={setPush}>
            {t('channelPush')}
          </CheckRow>
          <CheckRow checked={sms} onChange={setSms}>
            {t('channelSms')}
          </CheckRow>
          <CheckRow checked={emailChannel} onChange={setEmailChannel}>
            {t('channelEmail')}
          </CheckRow>
          <p className="pt-1 text-xs text-gray-500">{t('channelsHint')}</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}
