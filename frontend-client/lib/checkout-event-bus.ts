type CheckoutEvent = 'TIEMPO_EXPIRADO';

type Listener = () => void;

class CheckoutEventBus {
  private listeners = new Map<CheckoutEvent, Set<Listener>>();

  subscribe(evento: CheckoutEvent, listener: Listener): () => void {
    const listenersEvento = this.listeners.get(evento) ?? new Set<Listener>();
    listenersEvento.add(listener);
    this.listeners.set(evento, listenersEvento);
    return () => {
      const actuales = this.listeners.get(evento);
      if (!actuales) return;
      actuales.delete(listener);
      if (actuales.size === 0) {
        this.listeners.delete(evento);
      }
    };
  }

  emit(evento: CheckoutEvent): void {
    const listenersEvento = this.listeners.get(evento);
    if (!listenersEvento) return;
    listenersEvento.forEach((listener) => listener());
  }
}

export const checkoutEventBus = new CheckoutEventBus();

