import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "./api";
import type { RegisterRequest } from "./types";
import { useState } from "react";

const schema = z
  .object({
    firstName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    lastName: z.string().min(2, "Soyad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta yazın"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string().min(6, "Şifre tekrar zorunlu"),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    dealerId: z.union([z.string(), z.number()]).optional(),
    roleId: z.union([z.string(), z.number()]).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterForm() {
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
    onSuccess: (res) => {
      // Backend "message" ve "data" ile ne dönerse onu kullanabilirsin
      setServerMsg(res.message);
      console.log("Kayıt sonucu:", res);
    },
    onError: (err: any) => {
      setServerMsg(err?.response?.data?.message ?? "Kayıt başarısız");
    },
  });

  const onSubmit = (values: FormValues) => {
    const { confirmPassword, ...rest } = values; // confirmPassword'u ayır
    const payload: RegisterRequest = {
      ...rest,
      dealerId: values.dealerId ? Number(values.dealerId) : undefined,
      roleId: values.roleId ? Number(values.roleId) : undefined,
      address: values.address || "", // boş bırakılırsa "" gönder
      phoneNumber: values.phoneNumber || "",
    };
    return mutation.mutateAsync(payload);
  };

  return (
    <section
      className="sherah-wc sherah-wc__full sherah-wc-singup sherah-bg-cover"
      style={{ backgroundImage: "url('src/assets/img/credential-bg.svg')" }}
    >
      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-lg-6 col-md-6 col-12 sherah-wc-col-one">
            <div
              className="sherah-wc__inner"
              style={{
                backgroundImage: "url('src/assets/img/welcome-bg.png')",
              }}
            >
              <div className="sherah-wc__logo">
                <a href="/">
                  <img src="src/assets/img/logo.png" alt="logo" />
                </a>
              </div>
              <div className="sherah-wc__middle">
                <a href="/">
                  <img src="src/assets/img/welcome-vector.png" alt="welcome" />
                </a>
              </div>
              <h2 className="sherah-wc__title">
                Welcome to Sherah eCommerce <br /> Admin Panel
              </h2>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-12 sherah-wc-col-two">
            <div className="sherah-wc__form">
              <div className="sherah-wc__form-inner">
                <h3 className="sherah-wc__form-title sherah-wc__form-title__one">
                  Kayıt Ol <span>Lütfen bilgilerinizi giriniz</span>
                </h3>

                <form
                  className="sherah-wc__form-main p-0"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="row">
                    <div className="col-lg-6 col-md-6 col-12">
                      <div className="form-group">
                        <label className="sherah-wc__form-label">Ad *</label>
                        <div className="form-group__input">
                          <input
                            className="sherah-wc__form-input"
                            type="text"
                            {...register("firstName")}
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-danger">
                            {errors.firstName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-lg-6 col-md-6 col-12">
                      <div className="form-group">
                        <label className="sherah-wc__form-label">Soyad *</label>
                        <div className="form-group__input">
                          <input
                            className="sherah-wc__form-input"
                            type="text"
                            {...register("lastName")}
                          />
                        </div>
                        {errors.lastName && (
                          <p className="text-danger">
                            {errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="sherah-wc__form-label">
                          Email Address
                        </label>
                        <div className="form-group__input">
                          <input
                            className="sherah-wc__form-input"
                            type="email"
                            {...register("email")}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-danger">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="sherah-wc__form-label">Şifre</label>
                        <div className="form-group__input">
                          <input
                            className="sherah-wc__form-input"
                            type="password"
                            {...register("password")}
                          />
                        </div>
                        {errors.password && (
                          <p className="text-danger">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="sherah-wc__form-label">
                          Şifre Tekrar
                        </label>
                        <div className="form-group__input">
                          <input
                            className="sherah-wc__form-input"
                            type="password"
                            {...register("confirmPassword")}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-danger">
                            {errors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group form-mg-top25">
                        <div className="sherah-wc__button sherah-wc__button--bottom">
                          <button
                            className="ntfmax-wc__btn"
                            type="submit"
                            disabled={isSubmitting || mutation.isPending}
                          >
                            {mutation.isPending
                              ? "Gönderiliyor..."
                              : "Kayıt Ol"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {serverMsg && (
                      <div className="col-12">
                        <p>{serverMsg}</p>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
