import { emitAuthFailure, onAuthFailure } from '../auth-events';

describe('auth-events', () => {
  it('notifies subscribers on emitAuthFailure', () => {
    const listener = jest.fn();
    const unsubscribe = onAuthFailure(listener);
    emitAuthFailure();
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    emitAuthFailure();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
