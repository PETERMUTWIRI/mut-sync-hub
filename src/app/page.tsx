import { redirect } from 'next/navigation';

export default function HomeRedirect() {
  redirect('/main'); // redirects to the (main) folder’s page
}
