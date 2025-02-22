import styles from './Pagination.module.sass';

interface PaginationProps {
    className?: string;
    totalPage?: number;
    page: number;
    disableNext?: boolean
    onChange: (page: number) => void;
}

const Pagination = ({ className, totalPage = 0, page, onChange, disableNext }: PaginationProps) => {

    const handlePrevious = () => {
        if (page > 1) {
            onChange(page - 1);
        }
    };

    const handleNext = () => {
        if (page < totalPage) {
            onChange(page + 1);
        }
    };

    return (
        <div className={`${styles.pagination} ${className || ''}`}>
            <button
                className={styles.pageButton}
                onClick={handlePrevious}
                disabled={page === 1}
            >
                <i aria-hidden className="fa-solid fa-chevron-left"></i>
            </button>
            <input
                type="number"
                value={page}
                className={styles.pageInput}
                disabled
                min={1}
                max={totalPage || 1}
            />
            <button
                className={styles.pageButton}
                onClick={handleNext}
                // disabled={disableNext}
                disabled={page === totalPage}
            >
                <i aria-hidden className="fa-solid fa-chevron-right"></i>
            </button>
            <span className={styles.pageInfo} style={{ fontSize: '0.9rem' }}>
                {totalPage || '-'} Pages
            </span>
        </div>
    );
};

export default Pagination;


