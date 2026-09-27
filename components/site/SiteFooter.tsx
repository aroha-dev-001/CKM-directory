import Link from "next/link";
import { CKM } from "@/lib/data";
import { T } from "./T";

export function SiteFooter() {
  const official = CKM.official;
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <p className="wordmark-en">Chikkamagaluru</p>
            <p className="wordmark-kn">ಚಿಕ್ಕಮಗಳೂರು</p>
            <p style={{ marginTop: "0.8rem", color: "rgba(243,238,228,.7)" }}>
              <T k="disclaimer" />
            </p>
          </div>
          <div>
            <h2 className="kicker">
              <T k="official" />
            </h2>
            <ul>
              <li>
                <a href={official.district_en} rel="noopener noreferrer">
                  chikkamagaluru.nic.in, tourism
                </a>
              </li>
              <li>
                <a href={official.district_kn} rel="noopener noreferrer">
                  ಕನ್ನಡ ಪ್ರವಾಸೋದ್ಯಮ ಪುಟ
                </a>
              </li>
              <li>
                <a href={official.karnataka_tourism} rel="noopener noreferrer">
                  Karnataka Tourism
                </a>
              </li>
              <li>
                <a href={official.forest} rel="noopener noreferrer">
                  Karnataka Forest Department
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="kicker">Pages</h2>
            <ul>
              <li>
                <Link href="/#explore-chikmagaluru">Explore</Link>
              </li>
              <li>
                <Link href="/food">Food</Link>
              </li>
              <li>
                <Link href="/nature">Nature</Link>
              </li>
              <li>
                <Link href="/stay">Hill air</Link>
              </li>
              <li>
                <Link href="/heritage">Heritage</Link>
              </li>
              <li>
                <Link href="/places">Places</Link>
              </li>
              <li>
                <Link href="/map">District map</Link>
              </li>
              <li>
                <Link href="/plan">Plan</Link>
              </li>
              <li>
                <Link href="/visit">Visitor information</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="fineprint">
          Independent static companion. Source links remain the authority for access, fees, permits and announcements. Map
          boundaries © OpenStreetMap contributors (ODbL).
        </p>
      </div>
    </footer>
  );
}
