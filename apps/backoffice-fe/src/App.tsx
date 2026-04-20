// backoffice-fe — Staff admin UI (React SPA).
//
// Talks only to backoffice-be (via the api-gateway). Renders the order queue
// for staff; type-shares with the backend through the @marola/backoffice-be
// package so a backend shape change is a compile error here, not a runtime bug.
import { useEffect, useState } from "react";
import type { OrderSummary, StaffSession } from "@marola/backoffice-be";
import { fetchSession, listOrders } from "./api";

export default function App() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    fetchSession(token).then(setSession);
    listOrders(token).then(setOrders);
  }, []);

  if (!session) return <main>Sign in to the Marola backoffice</main>;

  return (
    <main>
      <h1>Marola backoffice</h1>
      <p>
        {session.role} — {session.roles.join(", ")}
      </p>
      <table>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.channel}</td>
              <td>{o.status}</td>
              <td>
                {o.totalCents / 100} {o.currency}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
