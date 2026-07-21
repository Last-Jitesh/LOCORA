// vite.config.ts
import { defineConfig } from "file:///C:/Users/BIT/Desktop/Locora-updated/LOCORA-main/client/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/BIT/Desktop/Locora-updated/LOCORA-main/client/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/BIT/Desktop/Locora-updated/LOCORA-main/client/node_modules/@tailwindcss/vite/dist/index.mjs";
import { VitePWA } from "file:///C:/Users/BIT/Desktop/Locora-updated/LOCORA-main/client/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "back-ground.png"],
      manifest: {
        name: "Locora",
        short_name: "Locora",
        description: "The Social Layer of Every Neighborhood",
        theme_color: "#8B6914",
        background_color: "#1A1208",
        display: "standalone",
        icons: [
          { src: "/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: "NetworkFirst",
            options: { cacheName: "api-cache", expiration: { maxEntries: 100, maxAgeSeconds: 300 } }
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCSVRcXFxcRGVza3RvcFxcXFxMb2NvcmEtdXBkYXRlZFxcXFxMT0NPUkEtbWFpblxcXFxjbGllbnRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEJJVFxcXFxEZXNrdG9wXFxcXExvY29yYS11cGRhdGVkXFxcXExPQ09SQS1tYWluXFxcXGNsaWVudFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQklUL0Rlc2t0b3AvTG9jb3JhLXVwZGF0ZWQvTE9DT1JBLW1haW4vY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2xvZ28ucG5nJywgJ2JhY2stZ3JvdW5kLnBuZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ0xvY29yYScsXG4gICAgICAgIHNob3J0X25hbWU6ICdMb2NvcmEnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBTb2NpYWwgTGF5ZXIgb2YgRXZlcnkgTmVpZ2hib3Job29kJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjOEI2OTE0JyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMxQTEyMDgnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAgeyBzcmM6ICcvbG9nby5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9LFxuICAgICAgICAgIHsgc3JjOiAnL2xvZ28ucG5nJywgc2l6ZXM6ICc1MTJ4NTEyJywgdHlwZTogJ2ltYWdlL3BuZycsIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgICAgd29ya2JveDoge1xuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9hcGlcXC4vLFxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXG4gICAgICAgICAgICBvcHRpb25zOiB7IGNhY2hlTmFtZTogJ2FwaS1jYWNoZScsIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAwLCBtYXhBZ2VTZWNvbmRzOiAzMDAgfSB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7IHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsIGNoYW5nZU9yaWdpbjogdHJ1ZSB9LFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBa1csU0FBUyxvQkFBb0I7QUFDL1gsT0FBTyxXQUFXO0FBQ2xCLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsZUFBZTtBQUV4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsWUFBWSxpQkFBaUI7QUFBQSxNQUM3QyxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsVUFDTCxFQUFFLEtBQUssYUFBYSxPQUFPLFdBQVcsTUFBTSxZQUFZO0FBQUEsVUFDeEQsRUFBRSxLQUFLLGFBQWEsT0FBTyxXQUFXLE1BQU0sYUFBYSxTQUFTLGVBQWU7QUFBQSxRQUNuRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLGNBQWMsQ0FBQyxzQ0FBc0M7QUFBQSxRQUNyRCxnQkFBZ0I7QUFBQSxVQUNkO0FBQUEsWUFDRSxZQUFZO0FBQUEsWUFDWixTQUFTO0FBQUEsWUFDVCxTQUFTLEVBQUUsV0FBVyxhQUFhLFlBQVksRUFBRSxZQUFZLEtBQUssZUFBZSxJQUFJLEVBQUU7QUFBQSxVQUN6RjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sT0FBTztBQUFBLE1BQ0wsUUFBUSxFQUFFLFFBQVEseUJBQXlCLGNBQWMsS0FBSztBQUFBLElBQ2hFO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
