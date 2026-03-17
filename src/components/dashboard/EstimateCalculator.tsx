import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Calculator, Plus, Minus } from "lucide-react";

interface LineItem {
  id: number;
  name: string;
  qty: number;
  price: number;
}

const defaultItems: LineItem[] = [
  { id: 1, name: "Межкомнатная дверь (монтаж)", qty: 1, price: 3500 },
  { id: 2, name: "Входная дверь (монтаж)", qty: 0, price: 5000 },
  { id: 3, name: "Перегородка (монтаж)", qty: 0, price: 8000 },
  { id: 4, name: "Демонтаж старой двери", qty: 0, price: 1500 },
  { id: 5, name: "Расширение проёма", qty: 0, price: 4000 },
  { id: 6, name: "Монтажная пена", qty: 1, price: 800 },
  { id: 7, name: "Фурнитура (комплект)", qty: 1, price: 2500 },
  { id: 8, name: "Доборы / наличники", qty: 0, price: 3000 },
];

interface Props {
  role: "admin" | "manager" | "measurer" | "installer";
}

const EstimateCalculator = ({ role }: Props) => {
  const { user } = useAuth();
  const [items, setItems] = useState<LineItem[]>(defaultItems);

  const updateQty = (id: number, delta: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ));
  };

  const updatePrice = (id: number, price: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, price } : item
    ));
  };

  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <DashboardLayout role={role} userName={user?.name}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Калькулятор смет</h1>
        <Card className="bg-white border-slate-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div className="flex-1 text-sm text-slate-700">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updatePrice(item.id, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 rounded border border-slate-200 text-sm text-right"
                    />
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-slate-800">
                    {(item.qty * item.price).toLocaleString("ru-RU")} ₽
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-lg font-semibold text-slate-900">Итого:</span>
              <span className="text-2xl font-bold text-blue-600">{total.toLocaleString("ru-RU")} ₽</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EstimateCalculator;
