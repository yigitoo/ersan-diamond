"use client";

import Link from "next/link";
import {
  Shield,
  Search,
  Cog,
  FileCheck,
  Award,
  Hash,
  Lock,
  Eye,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/shared/section-heading";
import { useI18n } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AboutPage() {
  const { t } = useI18n();

  // ---------------------------------------------------------------------------
  // Authentication steps
  // ---------------------------------------------------------------------------
  const AUTH_STEPS = [
    {
      step: 1,
      icon: <Hash size={24} />,
      title: t("Seri Numarası Doğrulaması", "Serial Number Verification"),
      description: t(
        "Her seri numarası, köken ve geçerliliği doğrulamak için üretici kayıtları ve küresel veritabanlarıyla karşılaştırılır.",
        "Every serial number is cross-referenced against manufacturer records and global databases to confirm origin and validity."
      ),
    },
    {
      step: 2,
      icon: <Cog size={24} />,
      title: t("Mekanizma İncelemesi", "Movement Inspection"),
      description: t(
        "Usta saatçilerimiz büyüteç altında kapsamlı bir mekanizma incelemesi yaparak kalibre, bitiş kalitesi ve üretici damgalarını doğrular.",
        "Our master watchmakers perform a thorough movement inspection under magnification, verifying caliber, finish quality, and manufacturer hallmarks."
      ),
    },
    {
      step: 3,
      icon: <Search size={24} />,
      title: t("Parça Orijinallik Kontrolü", "Parts Originality Check"),
      description: t(
        "Kadran, akrep/yelkovan, bezel, kurma düğmesi, kordon ve kasa, piyasa değişiklikleri veya değişimler açısından tek tek incelenir.",
        "Dial, hands, bezel, crown, bracelet, and case are individually inspected for aftermarket modifications or replacements."
      ),
    },
    {
      step: 4,
      icon: <FileCheck size={24} />,
      title: t("Belge Doğrulaması", "Documentation Verification"),
      description: t(
        "Tüm belgeler, garanti kartları ve sertifikalar orijinallik açısından doğrulanır ve parçayla eşleştirilir.",
        "All accompanying paperwork, warranty cards, and certificates are verified for authenticity and cross-matched with the piece."
      ),
    },
    {
      step: 5,
      icon: <Award size={24} />,
      title: t("Kayıt & Sertifikasyon", "Record & Certification"),
      description: t(
        "Orijinalliği onaylanmış her parça, koleksiyonumuza eklenmeden önce detaylı durum raporu ve orijinallik mühürümüzle belgelendirilir.",
        "Each authenticated piece receives a detailed condition report and our seal of authenticity before being listed in our collection."
      ),
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-24">
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
          {t(`${BRAND_NAME} Hakkında`, `About ${BRAND_NAME}`)}
        </h1>
        <p className="text-mist text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t(
            `İstanbul'da kurulan ${BRAND_NAME}, dünyanın en iyi ikinci el lüks saatlerini ve Hermès parçalarını bir araya getirmeye adanmıştır. Derin piyasa uzmanlığı ile orijinallik ve gizliliğe sarsılmaz bir bağlılık birleştiriyoruz.`,
            `Founded in Istanbul, ${BRAND_NAME} is dedicated to curating the world's finest pre-owned luxury watches and Hermès pieces. We combine deep market expertise with an unwavering commitment to authenticity and discretion.`
          )}
        </p>
      </section>

      {/* Only Original -- Authentication Process */}
      <section className="max-w-5xl mx-auto px-6 lg:px-8 mb-24">
        <SectionHeading
          title={t("Sadece Orijinal", "Only Original")}
          subtitle={t(
            "5 adımlı orijinallik kontrol sürecimiz, sunduğumuz her parçanın %100 orijinal olmasını sağlar",
            "Our 5-step authentication process ensures every piece we offer is 100% genuine"
          )}
        />

        <div className="relative">
          {/* Timeline line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-slate/50" />

          <div className="space-y-12 lg:space-y-16">
            {AUTH_STEPS.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={item.step}
                  className={`relative lg:grid lg:grid-cols-2 lg:gap-16 items-center`}
                >
                  {/* Step number dot on timeline */}
                  <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-charcoal border border-slate items-center justify-center z-10">
                    <span className="text-xs font-medium text-brand-gold">{item.step}</span>
                  </div>

                  {/* Content */}
                  <div
                    className={`${
                      isLeft ? "lg:pr-16 lg:text-right" : "lg:col-start-2 lg:pl-16"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-4 mb-3 ${
                        isLeft ? "lg:justify-end" : ""
                      }`}
                    >
                      {/* Mobile step number */}
                      <div className="lg:hidden w-8 h-8 rounded-full bg-charcoal border border-slate flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-brand-gold">{item.step}</span>
                      </div>
                      <div className="text-brand-gold">{item.icon}</div>
                      <h3 className="font-serif text-xl">{item.title}</h3>
                    </div>
                    <p className="text-sm text-mist leading-relaxed lg:max-w-md ml-12 lg:ml-0 lg:inline-block">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How We Source */}
      <section className="bg-charcoal/50 py-20 mb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SectionHeading title={t("Nasıl Tedarik Ediyoruz", "How We Source")} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-black border border-slate flex items-center justify-center mx-auto mb-4">
                <Users size={22} className="text-brand-gold" />
              </div>
              <h3 className="font-serif text-lg mb-2">{t("Güvenilir Ağ", "Trusted Network")}</h3>
              <p className="text-xs text-mist leading-relaxed">
                {t(
                  "En iyi parçaları tedarik etmek için dikkatlice seçilmiş küresel bir koleksiyoner, satıcı ve yetkili bayiler ağıyla çalışıyoruz.",
                  "We work with a carefully vetted global network of collectors, dealers, and authorized retailers to source the finest pieces."
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-black border border-slate flex items-center justify-center mx-auto mb-4">
                <Eye size={22} className="text-brand-gold" />
              </div>
              <h3 className="font-serif text-lg mb-2">{t("Uzman Seçimi", "Expert Curation")}</h3>
              <p className="text-xs text-mist leading-relaxed">
                {t(
                  "Her parça uzmanlarımız tarafından elle seçilir. Durum, konfigürasyon ve köken açısından yalnızca en iyi örnekleri seçeriz.",
                  "Every piece is hand-selected by our specialists. We choose only the best examples in terms of condition, configuration, and provenance."
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-brand-black border border-slate flex items-center justify-center mx-auto mb-4">
                <Shield size={22} className="text-brand-gold" />
              </div>
              <h3 className="font-serif text-lg mb-2">{t("Titiz Standartlar", "Rigorous Standards")}</h3>
              <p className="text-xs text-mist leading-relaxed">
                {t(
                  "Orijinallik kontrolümüzden geçmeyen veya kalite ölçütlerimizi karşılamayan her parçayı reddederiz. İstisna yok.",
                  "We reject any piece that does not pass our authentication process or meet our quality benchmarks. No exceptions."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 mb-24">
        <SectionHeading title={t("Gizlilik & Güvenlik", "Privacy & Security")} />

        <div className="bg-charcoal border border-slate/50 rounded-sm p-8 md:p-12">
          <div className="flex items-start gap-4 mb-6">
            <Lock size={24} className="text-brand-gold flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-serif text-xl mb-3">{t("Gizliliğiniz Bizim İçin Önemli", "Your Privacy Matters")}</h3>
              <p className="text-sm text-mist leading-relaxed mb-4">
                {t(
                  `${BRAND_NAME}'da gizlilik bir özellik değil, iş yapma şeklimizin temelidir. Müşterilerimizin lüks alımlarda her şeyden çok gizliliklerine değer verdiklerini biliyoruz.`,
                  `At ${BRAND_NAME}, discretion is not a feature — it is the foundation of how we operate. We understand that our clients value their privacy above all else when it comes to luxury acquisitions.`
                )}
              </p>
            </div>
          </div>
          <div className="space-y-4 ml-10">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <p className="text-sm text-soft-white">
                {t(
                  "Tüm müşteri bilgileri şifrelenir ve güvenli olarak saklanır. Kişisel verileri üçüncü taraflarla asla paylaşmayız.",
                  "All client information is encrypted and stored securely. We never share personal data with third parties."
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <p className="text-sm text-soft-white">
                {t(
                  "İşlemler en üst düzeyde gizlilikle yürütülür. Özel gösterimler ve gizli paketleme standartımızdır.",
                  "Transactions are conducted with the utmost confidentiality. Private viewings and discreet packaging are standard."
                )}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <p className="text-sm text-soft-white">
                {t(
                  "Ekibimiz sıkı gizlilik sözleşmeleri imzalar. Koleksiyon detaylarınız sizinle size atanan uzman arasında kalır.",
                  "Our team signs strict non-disclosure agreements. Your collection details remain between you and your dedicated specialist."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <div className="bg-charcoal border border-slate/50 rounded-sm py-16 px-8">
          <h2 className="font-serif text-3xl md:text-4xl mb-4">
            {t("Farkı Yaşayın", "Experience the Difference")}
          </h2>
          <p className="text-mist text-sm max-w-lg mx-auto mb-8">
            {t(
              "Nadir bir saat veya gözde bir Hermès çanta arıyorsanız, ekibimiz size yardımcı olmaya hazır.",
              "Whether you are looking to acquire a rare timepiece or a coveted Hermès bag, our team is ready to assist you."
            )}
          </p>
          <Link href="/concierge">
            <Button variant="primary" size="lg">
              {t("Randevunuzu Alın", "Book Your Appointment")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
