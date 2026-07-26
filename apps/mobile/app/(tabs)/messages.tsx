import { Redirect } from 'expo-router';

/** Tab entry → full inbox stack */
export default function MessagesTab() {
  return <Redirect href={'/inbox' as never} />;
}
