const CACHE_NAME = "gotcha-v1";
const STATIC_ASSETS = ["/", "/offline", "/manifest.json", "/favicon.ico", "/images/icon-512.png"];

// 설치 시 정적 자산 캐시
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화 시 오래된 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 푸시 알림 수신
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // JSON 파싱 실패 시 기본값 사용
  }
  const title = data.title || "갓챠";
  const options = {
    body: data.body || "",
    icon: "/images/icon-512.png",
    badge: "/images/icon-512.png",
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 시 앱으로 이동
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // 열린 탭이 없으면 새 탭 열기
      return self.clients.openWindow(url);
    })
  );
});

// 네트워크 우선, 실패 시 캐시 사용
self.addEventListener("fetch", (event) => {
  // GET 요청만 캐시 (Cache API는 GET만 지원)
  if (event.request.method !== "GET") {
    return;
  }

  // http/https 이외의 요청은 캐시하지 않음 (chrome-extension:// 등)
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // API 요청은 캐시하지 않음
  if (event.request.url.includes("/api/")) {
    return;
  }

  // 네비게이션 요청 처리
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/offline").then((res) => res || caches.match("/"));
      })
    );
    return;
  }

  // 정적 자산은 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // 백그라운드에서 새 버전 가져오기
        fetch(event.request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
        });
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
