import Inicio from "@/components/Inicio";
import { currentUser } from "@/lib/auth";

export default async function Home() {
  const user = await currentUser();

  return (
    <>
      <Inicio />
    </>
  );
}
