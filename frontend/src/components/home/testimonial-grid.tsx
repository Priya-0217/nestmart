import { Testimonial } from '@/lib/types';
import { RatingStars } from '@/components/ui/rating-stars';
import { StaggerItem, StaggerList } from '@/components/motion/stagger-list';

export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <StaggerList className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <StaggerItem key={testimonial.id}>
          <article className="surface relative h-full overflow-hidden p-5">
            <span aria-hidden className="review-sweep" />
            <RatingStars rating={testimonial.rating} />
            <p className="mt-3 text-sm leading-6 text-foreground/80">“{testimonial.quote}”</p>
            <div className="mt-4">
              <p className="text-sm font-semibold">{testimonial.name}</p>
              <p className="text-xs text-foreground/60">{testimonial.role}</p>
            </div>
          </article>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
