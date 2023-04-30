import { useEffect, useState } from "react";
import Head from "@/components/Head";
import Loading from "@/components/Loading";
import useAuth from "@/lib/hooks/useAuth";
import AssistantMenu from "@/components/AssistantMenu";
import useToast from "@/lib/hooks/useToast";
import { createRunner } from "@/lib/firebaseUtils";
import useCollectionAsDict from "@/lib/hooks/useCollectionAsDict";
import { Runner } from "@/lib/interfaces";

export default function AssistantCreateRunner() {
  const [runners, runnersLoading, runnersError] = useCollectionAsDict<Runner>(
    "apps/24-stunden-lauf/runners"
  );

  const { isLoggedIn, user } = useAuth();
  const { promiseToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [number, setNumber] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
  }, [isLoggedIn]);

  if (!user) {
    return <Loading />;
  }

  async function createRunnerHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string;

    promiseToast(createRunner(name, runners), {
      pending: "Läufer wird erstellt...",
      success: "Läufer wurde erstellt!",
      error: {
        render: (error) => {
          if (error instanceof Error) {
            return error.message;
          }
          return "Unbekannter Fehler";
        },
      },
    })
      .then((number) => {
        setNumber(number);
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <>
      <Head title="Assistent" />
      <main className="main">
        <div className="small-card">
          <div className="card-body gap-3">
            {number != 0 ? (
              <>
                <h1 className="text-center font-bold text-xl">
                  Läufer erstellt
                </h1>
                <input
                  name={"text"}
                  className="input input-bordered w-full max-w-xs input-disabled"
                  readOnly={true}
                  type={"text"}
                  value={"Startnummer: " + number}
                  required
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setNumber(0);
                  }}
                >
                  Okay!
                </button>
              </>
            ) : (
              <form
                onSubmit={createRunnerHandler}
                className="flex flex-col gap-3"
              >
                <h1 className="text-center font-bold text-xl">
                  Läufer hinzufügen
                </h1>
                <input
                  id="name"
                  name="name"
                  className="input input-bordered w-full max-w-xs"
                  placeholder="Name"
                  autoFocus
                  type="text"
                  required
                  minLength={3}
                />
                <button
                  className={`btn btn-primary btn-outline w-full ${
                    submitting ? "btn-disabled loading" : ""
                  }`}
                  type="submit"
                  disabled={submitting}
                >
                  Hinzufügen
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
