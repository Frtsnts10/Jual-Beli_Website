"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Fades content up as it scrolls into view, staggered by index. */
export function Reveal({ index = 0, ...props }: HTMLMotionProps<"div"> & { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.04, ease: "easeOut" }}
      {...props}
    />
  );
}

/** Small lift + press feedback for clickable cards. */
export function Lift(props: HTMLMotionProps<"div">) {
  return <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} {...props} />;
}
