import { redirect } from 'next/navigation';

export default function GroupsRedirect() {
  redirect('/dashboard/people?tab=groups');
}
