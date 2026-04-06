import { Link } from 'react-router-dom';

interface Props {
  id: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  isPack?: boolean;
  image?: string;
}

export default function ProductCard({ id, name, price, oldPrice, isPack, image }: Props) {
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  return (
    <Link to={`/product/${id}`} className="border border-border group">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-opacity duration-500 opacity-0"
            loading="lazy"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          />
        ) : (

          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-3xl font-black">
            {name[0]}
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
            -{discount}%
          </span>
        )}
        {isPack && (
          <span className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5">
            PACK
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium text-foreground truncate">{name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-bold text-foreground">{price} DA</span>
          {oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{oldPrice} DA</span>
          )}
        </div>
      </div>
    </Link>
  );
}
