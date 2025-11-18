import React, { useState, useEffect } from 'react';
import { X, Crown, Check, Zap, Shield, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { getSubscriptionPlans, getCurrentSubscription, createSubscription } from '../api';

interface PaywallProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscriptionCreated?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ isOpen, onClose, onSubscriptionCreated }) => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const plansData = await getSubscriptionPlans();
      setPlans(plansData);
      
      try {
        const currentSub = await getCurrentSubscription();
        setCurrentPlan(currentSub);
      } catch (e: any) {
        // Если подписки нет (404), это нормально
        if (e.status === 404 || e.message?.includes('404') || e.message?.includes('не найден')) {
          setCurrentPlan(null);
        } else {
          console.error('Ошибка загрузки текущей подписки:', e);
        }
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const isFreePlan = (plan: any) => plan.price === 0 || plan.name === 'FREE';

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return 'Бесплатно';
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === 'RUB' ? 'RUB' : 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePlanSelect = (plan: any) => {
    if (isFreePlan(plan)) {
      createSubscription(plan, 'CARD');
    } else {
      setSelectedPlan(plan);
    }
  };

  const handlePaymentMethod = async (paymentMethod: string) => {
    if (!selectedPlan) return;
    try {
      setCreating(true);
      setError('');
      const response = await createSubscription({
        planName: selectedPlan.name,
        paymentMethod
      });

      if (response.success) {
        if (response.paymentUrl) {
          window.location.href = response.paymentUrl;
        } else {
          onSubscriptionCreated?.();
          onClose();
        }
      } else {
        setError(response.message || 'Ошибка создания подписки');
      }
    } catch (e: any) {
      setError(e.message || 'Ошибка создания подписки');
    } finally {
      setCreating(false);
    }
  };

  const isCurrentPlan = (plan: any) => {
    if (!currentPlan && isFreePlan(plan)) return true;
    return currentPlan?.plan?.id === plan.id;
  };

  if (!isOpen) return null;

  const freePlan = plans.find(p => isFreePlan(p));
  const paidPlan = plans.find(p => !isFreePlan(p));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Выберите тарифный план
            </h2>
            <p className="text-gray-600">
              Получите доступ ко всем нейросетям с удобными лимитами
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        ) : selectedPlan ? (
          <div className="px-6 pb-6">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Способ оплаты</h3>
                <p className="text-gray-600">Выберите удобный способ оплаты</p>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">
                    {formatPrice(selectedPlan.price, selectedPlan.currency)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handlePaymentMethod('CARD')}
                  disabled={creating}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex items-center gap-3"
                >
                  <CreditCard className="text-blue-500" size={24} />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Банковская карта</div>
                    <div className="text-sm text-gray-600">Visa, MasterCard, МИР</div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethod('MOBILE_PAYMENT')}
                  disabled={creating}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 transition-colors flex items-center gap-3"
                >
                  <Smartphone className="text-green-500" size={24} />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Мобильные платежи</div>
                    <div className="text-sm text-gray-600">Apple Pay, Google Pay, Samsung Pay</div>
                  </div>
                </button>

                <button
                  onClick={() => handlePaymentMethod('E_WALLET')}
                  disabled={creating}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 transition-colors flex items-center gap-3"
                >
                  <Wallet className="text-purple-500" size={24} />
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900">Электронные кошельки</div>
                    <div className="text-sm text-gray-600">ЮMoney, QIWI, WebMoney</div>
                  </div>
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setSelectedPlan(null)}
                  disabled={creating}
                  className="flex-1 py-2 px-4 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Назад
                </button>
              </div>

              {creating && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Создание подписки...
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {freePlan && (
                <div className={`relative p-6 rounded-xl border-2 transition-all ${
                  isCurrentPlan(freePlan) 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{freePlan.displayName}</h3>
                    <div className="text-3xl font-bold text-gray-900">Бесплатно</div>
                    <p className="text-sm text-gray-600 mt-2">Базовый функционал</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3">
                      <Check className="text-green-500" size={20} />
                      <span className="text-sm text-gray-700">Доступ к бесплатным нейросетям</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="text-green-500" size={20} />
                      <span className="text-sm text-gray-700">Ограниченное количество запросов к платным</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(freePlan)}
                    disabled={isCurrentPlan(freePlan) || creating}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isCurrentPlan(freePlan)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {isCurrentPlan(freePlan) ? 'Текущий план' : 'Выбрать план'}
                  </button>
                </div>
              )}

              {paidPlan && (
                <div className={`relative p-6 rounded-xl border-2 transition-all ${
                  isCurrentPlan(paidPlan)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-purple-300 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50'
                }`}>
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{paidPlan.displayName}</h3>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatPrice(paidPlan.price, paidPlan.currency)}
                      <span className="text-sm font-normal text-gray-500">/месяц</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Полный доступ</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center gap-3">
                      <Crown className="text-purple-500" size={20} />
                      <span className="text-sm text-gray-700">Доступ ко всем нейросетям</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Zap className="text-purple-500" size={20} />
                      <span className="text-sm text-gray-700">Лимиты из настроек сети</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="text-purple-500" size={20} />
                      <span className="text-sm text-gray-700">Дневные и месячные лимиты</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handlePlanSelect(paidPlan)}
                    disabled={isCurrentPlan(paidPlan) || creating}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      isCurrentPlan(paidPlan)
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                    }`}
                  >
                    {isCurrentPlan(paidPlan) ? 'Текущий план' : 'Выбрать план'}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={14} />
                <span>Защищено SSL шифрованием • Ю-Касса</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

