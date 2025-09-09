// src/pages/orders/OrderDetailPage.tsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../../services/orders/getOrderById";
import { listProductImages } from "../../services/products/images/list";
import type { OrderResponse } from "../../types/order";
import emailIconUrl from "../../assets/img/email.svg";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<Record<number, string>>({});

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getOrderById(Number(id));
        setOrder(data);

        const results = await Promise.all(
          data.items.map(async (it) => {
            const imgs = await listProductImages(it.productId);
            return {
              productId: it.productId,
              url: imgs[1]?.imageUrl ?? "/src/assets/img/resim-yok.jpg",
            };
          })
        );

        const map: Record<number, string> = {};
        results.forEach((r) => {
          map[r.productId] = r.url;
        });
        setImages(map);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center my-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Yükleniyor</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return <div className="alert alert-danger">Sipariş bulunamadı.</div>;
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="sherah-body">
          <div className="sherah-dsinner">
            {/* Breadcrumb */}
            <div className="row mg-top-30">
              <div className="col-12 sherah-flex-between">
                <div className="sherah-breadcrumb">
                  <h2 className="sherah-breadcrumb__title">Sipariş Detayı</h2>
                  <ul className="sherah-breadcrumb__list">
                    <li>
                      <a href="/">Anasayfa</a>
                    </li>
                    <li className="active">
                      <a href={`/admin/orders/${order.id}`}>
                        Sipariş #{order.orderNumber}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Order Header */}
            <div className="sherah-page-inner sherah-border sherah-default-bg mg-top-25">
              <div className="sherah-table__head sherah-table__main">
                <h4 className="sherah-order-title">
                  Sipariş No #{order.orderNumber}
                </h4>
                <div className="sherah-order-right">
                  <p className="sherah-order-text">
                    {new Date(order.orderDate).toLocaleString()} /{" "}
                    {order.items.length} ürün / Toplam {order.totalAmount}{" "}
                    {order.currency}
                  </p>
                  <div className="sherah-table-status">
                    <div className="sherah-table__status sherah-color3 sherah-color3__bg--opactity">
                      {order.orderStatus}
                    </div>
                  </div>
                </div>
              </div>

              <div className="row align-items-stretch">
                {/* Ürünler */}
                <div className="col-lg-6 col-md-12 col-12 mt-3">
                  <div className="sherah-table-order h-100">
                    <table className="sherah-table__main sherah-table__main--orderv1">
                      <thead className="sherah-table__head">
                        <tr>
                          <th>Ürün</th>
                          <th>Ürün Adı</th>
                          <th>Fiyat</th>
                          <th>Toplam</th>
                        </tr>
                      </thead>
                      <tbody className="sherah-table__body">
                        {(order.items ?? []).map((it, idx) => (
                          <tr
                            key={it.productPriceId ?? `${it.productId}-${idx}`}
                          >
                            <td>
                              <div className="sherah-table__product--thumb">
                                <img
                                  src={
                                    images[it.productId] ??
                                    "/src/assets/img/resim-yok.jpg"
                                  }
                                  alt={it.productName}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "contain",
                                  }}
                                  className="border p-2 rounded-2"
                                />
                              </div>
                            </td>
                            <td>
                              <div className="sherah-table__product-name">
                                <h4 className="sherah-table__product-name--title">
                                  {it.productName}
                                </h4>
                              </div>
                            </td>
                            <td>
                              <div className="d-flex gap-1">
                                {it.unitPrice}{" "}
                                <p className="d-block">{order.currency}</p>
                                <p className="sherah-table__product-name--text">
                                  x {it.quantity}
                                </p>
                              </div>
                            </td>
                            <td>
                              <p>
                                {it.totalPrice} {order.currency}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Totals */}
                    <div className="order-totals">
                      <ul className="order-totals__list">
                        <li>
                          <span>Tutar</span>
                          <span className="order-totals__amount">
                            {order.subtotal} {order.currency}
                          </span>
                        </li>
                        {order.hasDiscount && (
                          <li>
                            <span>İndirim</span>
                            <span className="order-totals__amount text-success">
                              -{order.discountAmount} {order.currency}
                            </span>
                          </li>
                        )}
                        <li className="order-totals__bottom">
                          <span>Toplam</span>
                          <span className="order-totals__amount">
                            {order.totalAmount} {order.currency}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-12 mt-3">
                  <div className="sherah-contact-card sherah-default-bg sherah-border h-100">
                    <h4
                      className="sherah-contact-card__title d-flex align-items-center"
                      style={{ height: 80 }}
                    >
                      Notlar
                    </h4>
                    <div className="sherah-vcard__body d-block">
                      {order.notes && (
                        <div className="alert alert-warning">
                          <strong>Müşteri Notu:</strong>
                          <ul className="mt-2 list-unstyled">
                            {order.notes
                              .split("\n")
                              .filter((l) => l.trim() !== "")
                              .map((l, i) => (
                                <li key={i}>• {l}</li>
                              ))}
                          </ul>
                        </div>
                      )}

                      {order.adminNotes && (
                        <div className="alert alert-success">
                          <strong>Admin Notu:</strong>
                          <ul className="mt-2 list-unstyled">
                            {order.adminNotes
                              .split("\n")
                              .filter((l) => l.trim() !== "")
                              .map((l, i) => (
                                <li key={i}>• {l}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer + Notes */}
                <div className="col-lg-6 col-md-6 col-12 mt-3">
                  <div className="sherah-contact-card sherah-default-bg sherah-border">
                    <h4 className="sherah-contact-card__title">
                      Müşteri iletişimi
                    </h4>
                    <div className="sherah-vcard__body">
                      <div className="sherah-vcard__img">
                        <img
                          src="/src/assets/img/user-default.png"
                          alt={order.createdBy.fullName}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div className="sherah-vcard__content">
                        <h4 className="sherah-vcard__title">
                          {order.createdBy.fullName}
                        </h4>
                        <ul className="sherah-vcard__contact gap-2">
                          <li>
                            <a href={`mailto:${order.createdBy.email}`}>
                              <img
                                src={emailIconUrl}
                                alt="Email"
                                width={14}
                                height={14}
                                style={{ marginRight: 6 }}
                              />
                              {order.createdBy.email}
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* End dsinner */}
        </div>
      </div>
    </div>
  );
}
