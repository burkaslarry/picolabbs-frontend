/**
 * Simple skeleton placeholder for loading states. Use while data is fetching.
 */
export function SkeletonLine({ width = '100%', style = {} }) {
  return (
    <div
      style={{
        height: 14,
        borderRadius: 4,
        background: 'linear-gradient(90deg, var(--border) 25%, var(--surface-hover) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shine 1s ease-in-out infinite',
        width: width === '100%' ? '100%' : width,
        ...style,
      }}
    />
  );
}

export function LeadDetailSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <SkeletonLine width={80} />
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SkeletonLine width="40%" style={{ marginBottom: 8 }} />
        <SkeletonLine width="90%" style={{ marginBottom: 4 }} />
        <SkeletonLine width="70%" style={{ marginBottom: 4 }} />
        <SkeletonLine width="60%" />
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SkeletonLine width="30%" style={{ marginBottom: 8 }} />
        <SkeletonLine width="100%" style={{ marginBottom: 4 }} />
        <SkeletonLine width="95%" style={{ marginBottom: 4 }} />
        <SkeletonLine width="80%" />
      </div>
      <div className="card" style={{ marginBottom: '1rem' }}>
        <SkeletonLine width={120} style={{ marginBottom: 8 }} />
        <SkeletonLine width="100%" />
      </div>
    </div>
  );
}
