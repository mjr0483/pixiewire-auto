interface CardProps {
  href: string;
  icon: string;
  bg: string;
  name: string;
  desc: string;
}

function Card({ href, icon, bg, name, desc }: CardProps) {
  return (
    <a className="card" href={href} target="_blank" rel="noopener noreferrer">
      <div className={`card-icon ${bg}`} dangerouslySetInnerHTML={{ __html: icon }} />
      <div className="card-body">
        <div className="card-name">{name}</div>
        <div className="card-desc">{desc}</div>
      </div>
      <div className="card-arrow">&rsaquo;</div>
    </a>
  );
}

export default function Dashboard() {
  return (
    <>
      <div className="header">
        <h1>Dashboard</h1>
        <div className="brand">PixieWire</div>
      </div>

      <div className="section-label">PixieWire Site</div>
      <div className="grid">
        <Card href="https://pixiewire.com/" icon="&#127984;" bg="bg-gold" name="PixieWire" desc="Public website" />
        <Card href="https://pixiewire.com/admin" icon="&#128274;" bg="bg-red" name="PW Admin" desc="Content management" />
      </div>

      <div className="section-label">Automation</div>
      <div className="grid">
        <a className="card" href="/x-poster">
          <div className="card-icon bg-gray">&#120143;</div>
          <div className="card-body">
            <div className="card-name">X Auto-Poster</div>
            <div className="card-desc">Automated tweet scheduling &amp; generation</div>
          </div>
          <div className="card-arrow">&rsaquo;</div>
        </a>
      </div>

      <div className="section-label">Server Tools</div>
      <div className="grid">
        <Card href="https://log.pixiewire.com" icon="&#128203;" bg="bg-gold" name="AP & Mileage Tracker" desc="Annual Pass visits & mileage log" />
        <Card href="https://umami.pixiewire.com" icon="&#128202;" bg="bg-blue" name="Umami" desc="Website analytics" />
        <Card href="https://pixiepost.pixiewire.com" icon="&#128231;" bg="bg-purple" name="Postiz" desc="Social media scheduler" />
        <Card href="https://serp.pixiewire.com" icon="&#128269;" bg="bg-green" name="SerpBear" desc="SEO rank tracking" />
        <Card href="https://status.pixiewire.com" icon="&#9889;" bg="bg-green" name="Uptime Kuma" desc="Uptime monitoring" />
        <Card href="https://coolify.pixiewire.com" icon="&#9881;" bg="bg-red" name="Coolify" desc="Server & container management" />
        <Card href="https://n8n.pixiewire.com" icon="&#9881;" bg="bg-orange" name="n8n" desc="Workflow automation" />
      </div>

      <div className="section-label">Vendor Dashboards</div>
      <div className="grid">
        <Card href="https://supabase.com/dashboard/project/fjawkyijewhevyfcqpww" icon="&#128215;" bg="bg-green" name="Supabase" desc="Database, auth, and backend console" />
        <Card href="https://vercel.com/mjr0483s-projects/pixiewire" icon="&#9650;" bg="bg-gray" name="Vercel" desc="Deployments, domains, and runtime logs" />
        <Card href="https://analytics.google.com/analytics/web/#/a386847809p527545555/reports/intelligenthome" icon="&#128200;" bg="bg-orange" name="Google Analytics" desc="Audience and behavior reporting" />
        <Card href="https://search.google.com/search-console?resource_id=sc-domain%3Apixiewire.com" icon="&#128270;" bg="bg-blue" name="Google Search Console" desc="Search performance and indexing" />
        <Card href="https://app.beehiiv.com/" icon="&#128232;" bg="bg-gold" name="Beehiiv" desc="Newsletter platform dashboard" />
      </div>

      <div className="section-label">Content Management</div>
      <div className="grid">
        <Card href="https://business.facebook.com/latest/posts/" icon="&#128221;" bg="bg-blue" name="FB & IG Content" desc="Manage posts, reels, stories" />
      </div>

      <div className="section-label">Socials</div>
      <div className="grid">
        <Card href="https://x.com/PixieWireNews" icon="&#120143;" bg="bg-gray" name="X / Twitter" desc="@PixieWireNews" />
        <Card href="https://www.instagram.com/pixiewirenews" icon="&#128247;" bg="bg-purple" name="Instagram" desc="@pixiewirenews" />
        <Card href="https://www.facebook.com/pixiewire" icon="&#128077;" bg="bg-blue" name="Facebook" desc="Pixiewire" />
        <Card href="https://youtube.com/@PixieWire" icon="&#9654;" bg="bg-red" name="YouTube" desc="@PixieWire" />
        <Card href="https://www.tiktok.com/@pixiewirenews" icon="&#127925;" bg="bg-gray" name="TikTok" desc="@pixiewirenews" />
      </div>

      <div className="footer">Pixiewire Media LLC</div>
    </>
  );
}
