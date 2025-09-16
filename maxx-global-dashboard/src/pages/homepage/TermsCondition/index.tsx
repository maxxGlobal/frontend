import PageTitle from "../Helpers/PageTitle";
import Layout from "../Partials/Layout";

export default function TermsCondition() {
  return (
    <Layout childrenClasses="pt-0 pb-0">
      <div className="terms-condition-page w-full bg-white pb-[30px]">
        <div className="w-full mb-[30px]">
          <PageTitle
            breadcrumb={[
              { name: "Anasayfa", path: "/homepage" },
              { name: "Kalite Politikamız", path: "/homepage/quality-policy" },
            ]}
            title="Kalite Politikamız"
          />
        </div>
        <div className="w-full">
          <div className="container-x mx-auto">
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                1. Kalite
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Üretim süreçlerimizin her aşamasında mükemmelliği hedefleriz ve
                müşterilerimize en yüksek kaliteli ürün ve hizmetleri sunarız.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                2. Güvenilirlik
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7 mb-10">
                Müşterilerimizle uzun vadeli ve sağlam ilişkiler kurar, söz
                verdiğimiz her işte zamanında ve eksiksiz teslimat yaparız.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                3. İnovasyon
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Sürekli gelişen teknolojilere yatırım yaparak, sektördeki en
                yenilikçi çözümleri sunarız.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                4. Müşteri Odaklılık
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Müşterilerimizin ihtiyaçlarını anlamak ve onlara en uygun
                çözümleri sunmak için çalışırız.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                05.Sürdürülebilirlik
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Çevreye ve topluma duyarlı üretim süreçleri benimsiyor, gelecek
                nesillere daha iyi bir dünya bırakmayı hedefliyoruz.
              </p>
            </div>
            <div className="content-item w-full mb-10">
              <h2 className="text-[18px] font-medium text-qblack mb-5">
                05.Ekip Çalışması
              </h2>
              <p className="text-[15px] text-qgraytwo leading-7">
                Çalışanlarımızla birlikte güçlü bir takım ruhu oluşturur, her
                projede birlikte başarıyı hedefleriz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
