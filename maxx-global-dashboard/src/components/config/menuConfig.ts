export type PermissionFlags = {
  required?: string;
  anyOf?: string[];
  allOf?: string[];
};
export type MenuChild = {
  id: string;
  label: string;
  to?: string;
  href?: string;
} & PermissionFlags;

export type MenuItem = {
  id: string;
  label: string;
  iconHtml?: string;
  to?: string;
  href?: string;
  children?: MenuChild[];
} & PermissionFlags;

const DashboardIconHTML = `
<svg class="sherah-svg-icon" xmlns="http://www.w3.org/2000/svg" width="18.075" height="18.075" viewBox="0 0 18.075 18.075">
  <g transform="translate(0 0)">
    <path d="M6.966,6.025H1.318A1.319,1.319,0,0,1,0,4.707V1.318A1.319,1.319,0,0,1,1.318,0H6.966A1.319,1.319,0,0,1,8.284,1.318V4.707A1.319,1.319,0,0,1,6.966,6.025ZM1.318,1.13a.188.188,0,0,0-.188.188V4.707a.188.188,0,0,0,.188.188H6.966a.188.188,0,0,0,.188-.188V1.318a.188.188,0,0,0-.188-.188Z"/>
    <path d="M6.966,223.876H1.318A1.319,1.319,0,0,1,0,222.558V214.65a1.319,1.319,0,0,1,1.318-1.318H6.966a1.319,1.319,0,0,1,1.318,1.318v7.908A1.319,1.319,0,0,1,6.966,223.876Zm-5.648-9.414a.188.188,0,0,0-.188.188v7.908a.188.188,0,0,0,.188.188H6.966a.188.188,0,0,0,.188-.188V214.65a.188.188,0,0,0-.188-.188Z" transform="translate(0 -205.801)"/>
    <path d="M284.3,347.357H278.65a1.319,1.319,0,0,1-1.318-1.318V342.65a1.319,1.319,0,0,1,1.318-1.318H284.3a1.319,1.319,0,0,1,1.318,1.318v3.389A1.319,1.319,0,0,1,284.3,347.357Zm-5.648-4.9a.188.188,0,0,0-.188.188v3.389a.188.188,0,0,0,.188.188H284.3a.188.188,0,0,0,.188-.188V342.65a.188.188,0,0,0-.188-.188Z" transform="translate(-267.542 -329.282)"/>
    <path d="M284.3,10.544H278.65a1.319,1.319,0,0,1-1.318-1.318V1.318A1.319,1.319,0,0,1,278.65,0H284.3a1.319,1.319,0,0,1,1.318,1.318V9.226A1.319,1.319,0,0,1,284.3,10.544ZM278.65,1.13a.188.188,0,0,0-.188.188V9.226a.188.188,0,0,0,.188.188H284.3a.188.188,0,0,0,.188-.188V1.318a.188.188,0,0,0-.188-.188Z" transform="translate(-267.542)"/>
  </g>
</svg>
`;

const VendorsIconHTML = `
<svg class="sherah-svg-icon" xmlns="http://www.w3.org/2000/svg" width="22.038" height="17.943" viewBox="0 0 22.038 17.943">
  <g transform="translate(-325.516 -274.72)">
    <path d="M340.751,385.008c.034.446.08.824.088,1.2a.755.755,0,0,1-.86.88q-6.792.005-13.585,0c-.619,0-.88-.279-.878-.907a7.668,7.668,0,0,1,12.323-5.909c.071.054.145.1.241.172a5.8,5.8,0,0,1,2.906-1.574,5.524,5.524,0,0,1,6.566,5.177c.016.69-.23.954-.916.956-1.775,0-3.549,0-5.324,0Zm-1.467.59a6.1,6.1,0,0,0-6.281-5.43c-3.108.1-6.1,2.872-5.9,5.43Zm-.127-4.139c.349.615.686,1.16.97,1.731a.524.524,0,0,0,.55.351c1.649-.013,3.3-.006,4.947-.008.117,0,.234-.019.394-.034a4.053,4.053,0,0,0-6.861-2.042Z" transform="translate(0 -94.43)"/>
    <path d="M363.308,278.9a4.192,4.192,0,1,1,4.144,4.208A4.177,4.177,0,0,1,363.308,278.9Zm1.472-.009a2.721,2.721,0,1,0,2.718-2.7A2.717,2.717,0,0,0,364.779,278.892Z" transform="translate(-34.322)"/>
    <path d="M474.686,302.114a3.121,3.121,0,1,1-3.123,3.119A3.121,3.121,0,0,1,474.686,302.114Zm1.649,3.123a1.651,1.651,0,1,0-1.665,1.648A1.652,1.652,0,0,0,476.335,305.237Z" transform="translate(-132.638 -24.879)"/>
  </g>
</svg>
`;

export const menuItems: MenuItem[] = [
  {
    id: "menu-item_home",
    label: "Anasayfa",
    to: "/dashboard",
    iconHtml: DashboardIconHTML,
  },
  {
    id: "menu-item_vendors",
    label: "Vendors",
    iconHtml: VendorsIconHTML,
    children: [
      { id: "vendors_grid", label: "Vendor Grid", href: "vendor.html" },
      { id: "vendors_list", label: "Vendor List", href: "vendor-list.html" },
      {
        id: "vendors_profile",
        label: "Vendor Profile",
        href: "vendor-profile.html",
      },
    ],
  },
  {
    id: "menu-item__users",
    label: "Kullanıcılar",
    iconHtml: "<svg class='sherah-svg-icon' ...>...</svg>",
    children: [
      {
        id: "users_list",
        label: "Kullanıcı Listesi",
        to: "/users",
        required: "USER_READ",
      },
      {
        id: "users_create",
        label: "Kullanıcı Ekle",
        to: "/users/register",
        required: "USER_MANAGE",
      },
    ],
  },
];
