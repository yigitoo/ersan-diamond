"use client";

import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/animations";
import {
  BRAND_NAME,
  BRAND_EMAIL,
  BRAND_PHONE,
  BRAND_ADDRESS,
} from "@/lib/utils/constants";

// ---------------------------------------------------------------------------
// Privacy Policy Page -- KVKK & GDPR Compliant
// ---------------------------------------------------------------------------
export default function PrivacyPolicyPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Hero */}
      <motion.section
        className="max-w-4xl mx-auto px-6 lg:px-8 text-center mb-16"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-6">
          {t("Gizlilik Politikası", "Privacy Policy")}
        </h1>
        <p className="text-mist text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t(
            `${BRAND_NAME} olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve AB Genel Veri Koruma Tüzüğü (GDPR) kapsamında verilerinizin nasıl işlendiği hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.`,
            `At ${BRAND_NAME}, we are committed to protecting your personal data. This policy has been prepared in accordance with the Turkish Personal Data Protection Law No. 6698 (KVKK) and the EU General Data Protection Regulation (GDPR) to inform you about how your data is processed.`
          )}
        </p>
      </motion.section>

      {/* Sections */}
      <motion.div
        className="max-w-4xl mx-auto px-6 lg:px-8 space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Data Controller */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("1. Veri Sorumlusu", "1. Data Controller")}
          </h2>
          <p className="text-sm text-mist leading-relaxed">
            {t(
              `6698 sayılı Kanun uyarınca veri sorumlusu sıfatıyla hareket eden kuruluşun bilgileri aşağıdadır:`,
              `The entity acting as data controller pursuant to Law No. 6698 is identified below:`
            )}
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("Unvan", "Entity")}:</span>{" "}
              {BRAND_NAME}
            </p>
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("Adres", "Address")}:</span>{" "}
              {BRAND_ADDRESS}
            </p>
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("E-posta", "Email")}:</span>{" "}
              {BRAND_EMAIL}
            </p>
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("Telefon", "Phone")}:</span>{" "}
              {BRAND_PHONE}
            </p>
          </div>
        </motion.div>

        {/* 2. Data We Collect */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("2. Toplanan Veriler", "2. Data We Collect")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Hizmetlerimizi sunabilmek için aşağıdaki kişisel verileri topluyoruz:",
              "We collect the following personal data to provide our services:"
            )}
          </p>
          <ul className="space-y-3">
            {[
              t(
                "Kimlik bilgileri: ad, soyad",
                "Identity information: first name, last name"
              ),
              t(
                "İletişim bilgileri: e-posta adresi, telefon numarası",
                "Contact information: email address, phone number"
              ),
              t(
                "İletişim formu içerikleri: mesajlarınız ve talepleriniz",
                "Contact form content: your messages and requests"
              ),
              t(
                "Tarayıcı bilgileri: IP adresi, tarayıcı tipi, işletim sistemi (otomatik olarak toplanan)",
                "Browser information: IP address, browser type, operating system (collected automatically)"
              ),
              t(
                "İstek listesi tercihleri: tarayıcınızın yerel depolama alanında (localStorage) saklanan ürün tercihleri",
                "Wishlist preferences: product preferences stored in your browser's local storage (localStorage)"
              ),
              t(
                "Randevu bilgileri: tercih edilen tarih, saat ve hizmet türü",
                "Appointment information: preferred date, time, and service type"
              ),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                <span className="text-sm text-mist leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 3. Purpose of Processing */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("3. İşleme Amaçları", "3. Purpose of Processing")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:",
              "Your personal data is processed for the following purposes:"
            )}
          </p>
          <ul className="space-y-3">
            {[
              t(
                "Satış ve satış sonrası hizmetlerin yürütülmesi",
                "Management of sales and after-sales services"
              ),
              t(
                "Randevu planlama ve konsiyerj hizmetlerinin sunulması",
                "Appointment scheduling and concierge service delivery"
              ),
              t(
                "Müşteri taleplerine yanıt verilmesi ve iletişim yönetimi",
                "Responding to customer inquiries and communication management"
              ),
              t(
                "Yasal yükümlülüklerin yerine getirilmesi",
                "Fulfillment of legal obligations"
              ),
              t(
                "Açık rızanız dahilinde pazarlama ve kampanya bildirimleri",
                "Marketing and promotional communications with your explicit consent"
              ),
              t(
                "Hizmet kalitesinin iyileştirilmesi ve iş süreçlerinin geliştirilmesi",
                "Improvement of service quality and business processes"
              ),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                <span className="text-sm text-mist leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 4. Cookies & Local Storage */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t(
              "4. Çerezler ve Yerel Depolama",
              "4. Cookies & Local Storage"
            )}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              `${BRAND_NAME} web sitesi üçüncü taraf izleme çerezleri kullanmamaktadır. Yalnızca sitenin işlevselliğini sağlamak için gerekli teknik çerezler ve yerel depolama kullanılmaktadır.`,
              `The ${BRAND_NAME} website does not use third-party tracking cookies. Only technical cookies and local storage necessary for the functionality of the site are used.`
            )}
          </p>
          <div className="bg-brand-black/50 border border-slate/30 rounded-sm p-4 mt-4">
            <p className="text-sm text-brand-white font-medium mb-2">
              {t("İstek Listesi (Wishlist)", "Wishlist")}
            </p>
            <p className="text-sm text-mist leading-relaxed">
              {t(
                "İstek listesi verileriniz yalnızca tarayıcınızın yerel depolama alanında (localStorage) saklanmaktadır. Bu veriler sunucularımıza gönderilmez ve tamamen cihazınızda kalır. Tarayıcı verilerinizi temizleyerek istediğiniz zaman bu verileri silebilirsiniz.",
                "Your wishlist data is stored exclusively in your browser's local storage (localStorage). This data is not sent to our servers and remains entirely on your device. You can delete this data at any time by clearing your browser data."
              )}
            </p>
          </div>
        </motion.div>

        {/* 5. Email Communication */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("5. E-posta İletişimi", "5. Email Communication")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Size aşağıdaki durumlarda işlemsel e-postalar gönderebiliriz:",
              "We may send you transactional emails in the following cases:"
            )}
          </p>
          <ul className="space-y-3">
            {[
              t(
                "Randevu oluşturma, onaylama ve hatırlatma bildirimleri",
                "Appointment creation, confirmation, and reminder notifications"
              ),
              t(
                "Müşteri talebi ile ilgili bilgilendirmeler",
                "Customer inquiry (lead) related notifications"
              ),
              t(
                "Satış işlemleri ve fatura bildirimleri",
                "Sales transaction and invoice notifications"
              ),
              t(
                "Hesabınızla ilgili güvenlik bildirimleri",
                "Security notifications related to your account"
              ),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                <span className="text-sm text-mist leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-mist leading-relaxed mt-4">
            {t(
              "Pazarlama amaçlı e-postalar yalnızca açık rızanız ile gönderilir ve her zaman abonelikten çıkma seçeneği sunulur.",
              "Marketing emails are only sent with your explicit consent and always include an unsubscribe option."
            )}
          </p>
        </motion.div>

        {/* 6. Third-Party Services */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t(
              "6. Üçüncü Taraf Hizmetler",
              "6. Third-Party Services"
            )}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Hizmetlerimizi sunabilmek için aşağıdaki üçüncü taraf hizmet sağlayıcılarla çalışıyoruz. Bu sağlayıcılar verilerinize yalnızca belirtilen amaçlar doğrultusunda erişebilir:",
              "We work with the following third-party service providers to deliver our services. These providers may only access your data for the stated purposes:"
            )}
          </p>
          <div className="space-y-4">
            <div className="bg-brand-black/50 border border-slate/30 rounded-sm p-4">
              <p className="text-sm text-brand-white font-medium mb-1">
                Cloudflare
              </p>
              <p className="text-sm text-mist leading-relaxed">
                {t(
                  "İçerik dağıtım ağı (CDN) ve görsel barındırma hizmetleri. Web sitesi performansını ve güvenliğini artırmak için kullanılmaktadır.",
                  "Content delivery network (CDN) and image hosting services. Used to enhance website performance and security."
                )}
              </p>
            </div>
            <div className="bg-brand-black/50 border border-slate/30 rounded-sm p-4">
              <p className="text-sm text-brand-white font-medium mb-1">
                MongoDB Atlas
              </p>
              <p className="text-sm text-mist leading-relaxed">
                {t(
                  "Veritabanı barındırma hizmeti. Müşteri ve işlem verileri şifrelenmiş olarak saklanmaktadır.",
                  "Database hosting service. Customer and transaction data is stored with encryption."
                )}
              </p>
            </div>
            <div className="bg-brand-black/50 border border-slate/30 rounded-sm p-4">
              <p className="text-sm text-brand-white font-medium mb-1">
                Vercel
              </p>
              <p className="text-sm text-mist leading-relaxed">
                {t(
                  "Web uygulaması barındırma ve dağıtım platformu.",
                  "Web application hosting and deployment platform."
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 7. Data Retention */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("7. Veri Saklama Süresi", "7. Data Retention")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca veya yasal zorunluluklar çerçevesinde saklanmaktadır:",
              "Your personal data is retained for as long as the processing purpose requires or as mandated by legal obligations:"
            )}
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-brand-white">
                  {t("Denetim kayıtları", "Audit logs")}
                </span>
                <span className="text-sm text-mist">
                  {" "}&mdash; {t("90 gün süreyle saklanır", "retained for 90 days")}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-brand-white">
                  {t("Müşteri verileri", "Customer data")}
                </span>
                <span className="text-sm text-mist">
                  {" "}&mdash; {t(
                    "silme talebi yapılana veya iş ilişkisi sona erene kadar",
                    "until a deletion request is made or the business relationship ends"
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-brand-white">
                  {t("Satış ve fatura kayıtları", "Sales and invoice records")}
                </span>
                <span className="text-sm text-mist">
                  {" "}&mdash; {t(
                    "yasal saklama süresi boyunca (10 yıl)",
                    "for the duration of the legal retention period (10 years)"
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
              <div>
                <span className="text-sm text-brand-white">
                  {t("İletişim formu verileri", "Contact form data")}
                </span>
                <span className="text-sm text-mist">
                  {" "}&mdash; {t(
                    "talep karşılandıktan sonra en fazla 1 yıl",
                    "up to 1 year after the inquiry is resolved"
                  )}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 8. Your Rights */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("8. Haklarınız", "8. Your Rights")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "KVKK'nin 11. maddesi ve GDPR kapsamında aşağıdaki haklara sahipsiniz:",
              "Under Article 11 of KVKK and the GDPR, you have the following rights:"
            )}
          </p>
          <ul className="space-y-3">
            {[
              t(
                "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
                "Right to learn whether your personal data is being processed"
              ),
              t(
                "Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme",
                "Right to request information about the processing of your data"
              ),
              t(
                "Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme",
                "Right to learn the purpose of processing and whether your data is used accordingly"
              ),
              t(
                "Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme",
                "Right to know the third parties to whom your data is transferred domestically or abroad"
              ),
              t(
                "Kişisel verilerinizin eksik veya yanlış işlenmiş olması halinde bunların düzeltilmesini isteme",
                "Right to request correction of incomplete or inaccurate personal data"
              ),
              t(
                "KVKK'nin 7. maddesinde öngörülen koşullar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme",
                "Right to request deletion or destruction of your data under the conditions set out in Article 7 of KVKK"
              ),
              t(
                "İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme",
                "Right to object to any outcome arising from the analysis of your data exclusively through automated systems"
              ),
              t(
                "Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme",
                "Right to claim compensation for damages arising from unlawful processing of your data"
              ),
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-2 flex-shrink-0" />
                <span className="text-sm text-mist leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 9. Contact */}
        <motion.div
          className="bg-charcoal border border-slate/50 rounded-sm p-6 md:p-8"
          variants={staggerItem}
        >
          <h2 className="font-serif text-xl mb-4 text-brand-white">
            {t("9. İletişim", "9. Contact")}
          </h2>
          <p className="text-sm text-mist leading-relaxed mb-4">
            {t(
              "Kişisel verilerinizle ilgili taleplerinizi aşağıdaki iletişim kanalları üzerinden bize iletebilirsiniz:",
              "You can submit requests regarding your personal data through the following channels:"
            )}
          </p>
          <div className="space-y-3">
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("E-posta", "Email")}:</span>{" "}
              <a
                href={`mailto:${BRAND_EMAIL}`}
                className="underline underline-offset-4 hover:text-brand-gold transition-colors"
              >
                {BRAND_EMAIL}
              </a>
            </p>
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("Telefon", "Phone")}:</span>{" "}
              {BRAND_PHONE}
            </p>
            <p className="text-sm text-brand-white">
              <span className="text-brand-gold">{t("Adres", "Address")}:</span>{" "}
              {BRAND_ADDRESS}
            </p>
          </div>
          <p className="text-sm text-mist leading-relaxed mt-4">
            {t(
              "Talepleriniz en geç 30 gün içinde değerlendirilecek ve sonuçlandırılacaktır.",
              "Your requests will be evaluated and resolved within 30 days at the latest."
            )}
          </p>
        </motion.div>

        {/* Last Updated */}
        <motion.div
          className="text-center pt-8"
          variants={staggerItem}
        >
          <p className="text-xs text-mist/60">
            {t("Son güncelleme", "Last updated")}: {t("28 Şubat 2026", "February 28, 2026")}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
