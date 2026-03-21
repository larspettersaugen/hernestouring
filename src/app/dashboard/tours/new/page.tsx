import { redirect } from 'next/navigation';

export default function NewTourRedirectPage() {
  redirect('/dashboard/projects');
}
