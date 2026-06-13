import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Map(); // Kênh -> Danh sách callback
  }

  connect(token) {
    if (this.client && this.client.connected) return;

    // Thay đổi baseURL nếu cần thiết
    const socketUrl = 'http://localhost:8080/ws/elearning';
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      debug: function (str) {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected to WebSocket');
      
      // Khôi phục lại các subscription nếu bị đứt kết nối
      this.subscribers.forEach((callbacks, topic) => {
        this.client.subscribe(topic, (message) => {
          const body = JSON.parse(message.body);
          callbacks.forEach(cb => cb(body));
        });
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, []);
    }
    this.subscribers.get(topic).push(callback);

    // Nếu đã connect thì subscribe luôn
    if (this.client && this.client.connected) {
      this.client.subscribe(topic, (message) => {
        callback(JSON.parse(message.body));
      });
    }

    // Hàm unsubscribe
    return () => {
      const callbacks = this.subscribers.get(topic);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
