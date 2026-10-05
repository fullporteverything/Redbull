import { CREDITS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="foot">
      <details>
        <summary>
          Independent concept. Not affiliated with or endorsed by Red Bull GmbH; product names and marks belong to their owner. Shop is a
          demo. <span className="underline underline-offset-2">Photo credits</span>
        </summary>
        <ul>
          {CREDITS.map((c) => (
            <li key={c.use}>
              {c.use}: “<a href={c.url} target="_blank" rel="noreferrer">{c.title}</a>” by {c.creator},{" "}
              <a href={c.licenseUrl} target="_blank" rel="noreferrer">
                {c.license}
              </a>
              {c.note ?? (c.use.includes("can") ? " (background removed)" : " (cropped)")}
            </li>
          ))}
        </ul>
      </details>
    </footer>
  );
}
