// Simple hash-based SPA router
const Router = {
  routes: {},
  current: null,

  add(path, handler) {
    this.routes[path] = handler;
  },

  navigate(path) {
    window.location.hash = '#' + path;
  },

  start() {
    const handleRoute = () => {
      const hash = window.location.hash.slice(1) || '/';
      const path = hash.split('?')[0];
      this.current = path;

      // Check auth
      const isAuth = API.token;
      const publicRoutes = ['/login', '/signup'];

      if (!isAuth && !publicRoutes.includes(path)) {
        this.navigate('/login');
        return;
      }
      if (isAuth && publicRoutes.includes(path)) {
        this.navigate('/');
        return;
      }

      const handler = this.routes[path] || this.routes['/404'];
      if (handler) handler();
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }
};
