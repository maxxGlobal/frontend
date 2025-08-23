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

const UsersIconHTML = `
<svg class="sherah-svg-icon" xmlns="http://www.w3.org/2000/svg" width="22.038" height="17.943" viewBox="0 0 22.038 17.943">
  <g transform="translate(-325.516 -274.72)">
    <path d="M340.751,385.008c.034.446.08.824.088,1.2a.755.755,0,0,1-.86.88q-6.792.005-13.585,0c-.619,0-.88-.279-.878-.907a7.668,7.668,0,0,1,12.323-5.909c.071.054.145.1.241.172a5.8,5.8,0,0,1,2.906-1.574,5.524,5.524,0,0,1,6.566,5.177c.016.69-.23.954-.916.956-1.775,0-3.549,0-5.324,0Zm-1.467.59a6.1,6.1,0,0,0-6.281-5.43c-3.108.1-6.1,2.872-5.9,5.43Zm-.127-4.139c.349.615.686,1.16.97,1.731a.524.524,0,0,0,.55.351c1.649-.013,3.3-.006,4.947-.008.117,0,.234-.019.394-.034a4.053,4.053,0,0,0-6.861-2.042Z" transform="translate(0 -94.43)"/>
    <path d="M363.308,278.9a4.192,4.192,0,1,1,4.144,4.208A4.177,4.177,0,0,1,363.308,278.9Zm1.472-.009a2.721,2.721,0,1,0,2.718-2.7A2.717,2.717,0,0,0,364.779,278.892Z" transform="translate(-34.322)"/>
    <path d="M474.686,302.114a3.121,3.121,0,1,1-3.123,3.119A3.121,3.121,0,0,1,474.686,302.114Zm1.649,3.123a1.651,1.651,0,1,0-1.665,1.648A1.652,1.652,0,0,0,476.335,305.237Z" transform="translate(-132.638 -24.879)"/>
  </g>
</svg>
`;
const RolesIconHTML = `
<svg class="sherah-svg-icon" xmlns="http://www.w3.org/2000/svg" width="21.732" height="18" viewBox="0 0 21.732 18">
											<g id="Icon" transform="translate(-525.662 -352.927)">
											  <path id="Path_208" data-name="Path 208" d="M536.507,455.982q-4.327,0-8.654,0a1.953,1.953,0,0,1-2.188-2.2c0-.99-.005-1.979,0-2.969a3.176,3.176,0,0,1,3.309-3.315c.875,0,1.749.052,2.624.062a.451.451,0,0,0,.33-.168,3.237,3.237,0,0,1,2.94-1.527q1.654.024,3.309,0a3.262,3.262,0,0,1,2.947,1.52.621.621,0,0,0,.449.153,30.091,30.091,0,0,1,3.212.044,3.044,3.044,0,0,1,2.594,3.014c.021,1.117.014,2.234.005,3.351a1.909,1.909,0,0,1-2.054,2.032Q540.919,455.989,536.507,455.982Zm3.812-1.288c0-.187,0-.326,0-.465-.008-1.781.026-3.564-.042-5.342a1.8,1.8,0,0,0-1.929-1.74c-1.131-.012-2.263,0-3.394,0a1.961,1.961,0,0,0-2.22,2.212q0,2.439,0,4.878v.46Zm-8.89.011c.013-.11.026-.165.026-.22,0-1.781-.006-3.562.009-5.343,0-.337-.178-.37-.422-.37-.749,0-1.5-.024-2.248.006a1.849,1.849,0,0,0-1.837,1.763c-.044,1.172-.022,2.346-.013,3.519a.581.581,0,0,0,.6.639C528.826,454.716,530.111,454.705,531.429,454.705Zm10.165-.005c1.354,0,2.664.018,3.974-.011.377-.008.544-.315.544-.688,0-1.117.017-2.234-.007-3.35a1.867,1.867,0,0,0-1.823-1.87c-.762-.035-1.526,0-2.29-.01-.3,0-.41.114-.406.431.017,1.4.007,2.8.007,4.2Z" transform="translate(0 -85.056)"></path>
											  <path id="Path_209" data-name="Path 209" d="M609.243,356.712a3.775,3.775,0,1,1,3.788,3.764A3.775,3.775,0,0,1,609.243,356.712Zm1.279-.076a2.5,2.5,0,1,0,2.611-2.434A2.5,2.5,0,0,0,610.523,356.636Z" transform="translate(-76.492)"></path>
											  <path id="Path_210" data-name="Path 210" d="M548.151,397.022a2.819,2.819,0,1,1-2.842-2.82A2.827,2.827,0,0,1,548.151,397.022Zm-1.278.023a1.542,1.542,0,1,0-1.531,1.542A1.548,1.548,0,0,0,546.873,397.045Z" transform="translate(-15.421 -37.775)"></path>
											  <path id="Path_211" data-name="Path 211" d="M698.51,397.045a2.819,2.819,0,1,1,2.839,2.819A2.831,2.831,0,0,1,698.51,397.045Zm4.361.032a1.542,1.542,0,1,0-1.56,1.512A1.55,1.55,0,0,0,702.871,397.076Z" transform="translate(-158.187 -37.776)"></path>
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
    id: "menu-item__users",
    label: "Kullanıcılar",
    iconHtml: UsersIconHTML,
    children: [
      {
        id: "users_list",
        label: "Kullanıcı Listesi",
        to: "/users/list",
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
  {
    id: "menu-item__rol",
    label: "Roller",
    iconHtml: RolesIconHTML,
    children: [
      {
        id: "rol_add",
        label: "Rol Ekle",
        to: "/roles/new",
        required: "SYSTEM_ADMIN",
      },
      {
        id: "rol_list",
        label: "Rol Listesi",
        to: "/roles",
        required: "SYSTEM_ADMIN",
      },
    ],
  },
  {
    id: "menu-item__dealers",
    label: "Bayiler",
    iconHtml: RolesIconHTML,
    children: [
      {
        id: "dealers_add",
        label: "Bayi Ekle",
        to: "/dealers-add",
        required: "SYSTEM_ADMIN",
      },
      {
        id: "dealers_list",
        label: "Bayi Listesi",
        to: "/dealers",
        required: "SYSTEM_ADMIN",
      },
    ],
  },
  {
    id: "menu-item__category",
    label: "Kategoriler",
    iconHtml: RolesIconHTML,
    children: [
      {
        id: "category_add",
        label: "Kategori Ekle",
        to: "/category-add",
        required: "CATEGORY_MANAGE",
      },
      {
        id: "category_list",
        label: "Kategori Listesi",
        to: "/category",
        required: "CATEGORY_MANAGE",
      },
    ],
  },
];
