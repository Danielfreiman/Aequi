import React from 'react';
import { Dish } from '../types';

const dishes: Dish[] = [
  {
    id: '1',
    name: 'Massa Trufada',
    orders: 142,
    marginIncrease: 68,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwVEcURLMQMOjhIrmiz-kSjRy1uPNjOFk7LbzU1dStqwXwICv2z0365FUYTS90wUKcL-CyxHq4CSUcdiytIDMnzhdioqbSgmxd-Il88f1CkGiRIUaWZkkdGQ_2E-ITJh_g-YOo8O1LzaapyiVnudF-DD7hMLE0Wq_lN7jYk3HwLOGMrmTNQtyBym5M5aruXMPQq8TiTwMQjKX7-YVzEeuALYLDs-9qwYUu8-Sq3aWSKO_9F_2XWu0hBiGHG6KJ_Jo7uF7WwbWqdhrd'
  },
  {
    id: '2',
    name: 'Pizza Margherita',
    orders: 89,
    marginIncrease: 55,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnIvLSlktFEMtNrhDiaKTt_E2M_gu7sXs3lpSTGSsEcteKEQ8ZtcNiOvdc_8x4mfd6IoLTmrIfFUdDSGdB2_msyiQUbk8uDkiGi_clwGT8Be7Dzjd7XDz9_NAlv66oD38yEuNDn1gQVYeSjN9wyCDY7eN8O5r010aw_Zs1kROXgXqmG7RwSFtmaVUp6fmqNmHQY6dpJg57vO_iOqLoW7V-owPYdxVSvyWJqRptScJF3IMqxbD7lDZBQr-S8t3GmWqcbGzl8YNWCWy2'
  },
  {
    id: '3',
    name: 'Hambúrguer Wagyu',
    orders: 210,
    marginIncrease: 32,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB8tDvAaKF_Bvy8ttlxpzBfosKuGlSRqVwFydS1txNnGEFD3I4GnM99tl7Btuzicc66wfnwzqOZbQyhWFryUcDjgduvT5UUrhh3KmL5L7Lv6ja8NA5DarybH4Nm9CkTi5dwrswSUC-U0mwdEwz96_1RafOv-Owt3_rMBxuBP4fO0mKM79DdjVuHEGZcR0sbu1wd7BN-ZXomJ51W1DHyYGJxsta1Pt61K_N2W2itDDbq2LIoGeI6wHieLoFrwK_VRNelGrKp-xcuM67'
  },
  {
    id: '4',
    name: 'Trio de Gelato',
    orders: 45,
    marginIncrease: 85,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAINOyh3eBFHtT_qP5b6poqhvuLDPrItv1FAFp8VOJjtn0RQqiplmzpmPKA5I5bByoI1kxn4zZZySWhwImzSYmu8mJ2JP9-5QWLXdZCslBCmxxhlHHdkTkg6AI11x0uJYP9qnACIovz6k5iXs1w5jgVLfIXk-uS6XFdxYSQw3HIawJC_r2OAOMvTF5xWMd4aGsX8Xk2V6ibyn4btyC-UZmQCqT_folgu6LqRAm7S5dWDCEgRWRUtHyenhjGxGAEwMUtUTeUJwT5lO3Z'
  }
];

export const DishList: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      <table className="w-full text-left border-separate border-spacing-y-2">
        <thead className="sr-only">
          <tr>
            <th>Prato</th>
            <th>Margem</th>
          </tr>
        </thead>
        <tbody>
          {dishes.map((dish) => (
            <tr key={dish.id} className="group cursor-pointer">
              <td className="bg-gray-50/50 group-hover:bg-white rounded-l-xl p-3 border-y border-l border-transparent group-hover:border-gray-100 group-hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div 
                    className="size-10 rounded-lg bg-cover bg-center shrink-0" 
                    style={{ backgroundImage: `url('${dish.imageUrl}')` }}
                  />
                  <div>
                    <p className="text-sm font-bold text-navy leading-tight">{dish.name}</p>
                    <p className="text-[11px] text-gray-400">{dish.orders} pedidos</p>
                  </div>
                </div>
              </td>
              <td className="bg-gray-50/50 group-hover:bg-white rounded-r-xl p-3 border-y border-r border-transparent group-hover:border-gray-100 group-hover:shadow-sm transition-all text-right">
                <span 
                  className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    dish.marginIncrease > 60 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  +{dish.marginIncrease}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};