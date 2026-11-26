import { login } from "@/app/actions";

export function Setup({ missing }: { missing: string[] }) {
  return (
    <main className="gate">
      <section className="gate-card">
        <p className="brand-mark">FEVYORA</p>
        <h1>Tableau de bord</h1>
        <p>Remplis ces clés dans <code>dashboard/.env</code>, puis relance le dashboard.</p>
        <ul>
          {missing.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export function Login({ failed }: { failed?: boolean }) {
  return (
    <main className="gate">
      <section className="gate-card">
        <p className="brand-mark">FEVYORA</p>
        <h1>Admin</h1>
        <p>Entre le mot de passe pour voir les commandes, les clients et les produits.</p>
        <form action={login}>
          <label>
            Mot de passe
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          {failed ? <p className="error">Mot de passe incorrect.</p> : null}
          <button type="submit">Entrer</button>
        </form>
      </section>
    </main>
  );
}
