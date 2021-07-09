import Vue from "vue";
import VueRouter from "vue-router";
// import Home from "../views/Home.vue";
import { auth, usersCollection } from "../../fb";

Vue.use(VueRouter);

const requireAuth = async (to, from, next) => {
  let user = await auth.currentUser;
  if (user) {
    next();
  } else {
    next({ name: "Login" });
  }
};

// maybe refactor this or custom claims this
const requireAdmin = async (to, from, next) => {
  let userid = await auth.currentUser.uid;
  let admin = await usersCollection.doc(userid).get();
  if (admin.data().IsAdmin) {
    next();
  } else {
    next({ name: "Home" });
  }
};

const routes = [
  {
    path: "/",
    name: "Home",
    beforeEnter: requireAuth,
    // meta: {
    //   requiresAuth: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Home.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    beforeEnter: requireAdmin,
    // meta: {
    //   requiresAuth: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Admin.vue"),
  },
  {
    path: "/login",
    name: "Login",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // meta: {
    //   requiresGuest: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Login.vue"),
  },
  {
    path: "/reset",
    name: "Reset",
    // meta: {
    //   requiresGuest: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Reset.vue"),
  },
  {
    path: "/register",
    name: "Register",
    // meta: {
    //   requiresGuest: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Register.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    beforeEnter: requireAuth,
    // meta: {
    //   requiresGuest: true,
    // },
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Profile.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// // Nav Guard
// router.beforeEach((to, from, next) => {
//   // Check for requiresAuth guard
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     // Check if NO logged user
//     if (!firebase.auth().currentUser) {
//       // Go to login
//       next({
//         path: "/login",
//         query: {
//           redirect: to.fullPath,
//         },
//       });
//     } else {
//       // Proceed to route
//       next();
//     }
//   } else if (to.matched.some((record) => record.meta.requiresGuest)) {
//     // Check if NO logged user
//     if (firebase.auth().currentUser) {
//       // Go to login
//       next({
//         path: "/",
//         query: {
//           redirect: to.fullPath,
//         },
//       });
//     } else {
//       // Proceed to route
//       next();
//     }
//   } else {
//     // Proceed to route
//     next();
//   }
// });

// export default router;

// Nav Guard
// router.beforeEach((to, from, next) => {
//   // Check for requiresAuth guard
//   if (to.matched.some((record) => record.meta.requiresAuth)) {
//     // Check if NO logged user
//     if (!firebaseApp.auth().currentUser) {
//       // Go to login
//       next({
//         path: "/login",
//         query: {
//           redirect: to.fullPath,
//         },
//       });
//     } else {
//       // Proceed to route
//       next();
//     }
//   } else if (to.matched.some((record) => record.meta.requiresGuest)) {
//     // Check if NO logged user
//     if (firebaseApp.auth().currentUser) {
//       // Go to login
//       next({
//         path: "/",
//         query: {
//           redirect: to.fullPath,
//         },
//       });
//     } else {
//       // Proceed to route
//       next();
//     }
//   } else {
//     // Proceed to route
//     next();
//   }
// });

export default router;
