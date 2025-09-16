import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="terms-condition-page w-full bg-white pb-[30px]">
        <div className="w-full mb-[30px]">
          <PageTitle
            breadcrumb={[
              { name: "Anasayfa", path: "/homepage" },
              { name: "Kvkk", path: "homepage/kvkk" },
            ]}
            title="Kvkk"
          />
        </div>
        <div className="w-full">
          <div className="container-x mx-auto">
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                1. Vizyonumuz
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Medintera olarak, savunma ve medikal sektörlerinde en yenilikçi
                ve güvenilir üretim ortağı olmayı, teknolojiyi en üst düzeyde
                kullanarak global ölçekte tanınan bir marka haline gelmeyi
                hedefliyoruz. Müşteri memnuniyetini en üst seviyede tutarak,
                sürdürülebilir büyümeyi sağlamak ve sektörde lider konumda yer
                almak vizyonumuzdur.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                2. Misyonumuz
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7 mb-10">
                Misyonumuz, yüksek hassasiyet gerektiren üretim süreçlerinde
                müşterilerimize en kaliteli ve yenilikçi çözümleri sunmaktır.
                Kayar otomat tezgahları, kaplama, kumlama, taşlama, markalama,
                montaj ve polisaj gibi hizmetlerle, her projenin benzersiz
                ihtiyaçlarına uygun çözümler geliştiriyoruz. Fason üretimdeki
                tecrübemizi, Umay marka kalemlerimizin imalatındaki
                ustalığımızla birleştirerek, sektörde fark yaratmayı
                amaçlıyoruz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
