import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PaginationService {
  paginate<T>(items: T[], page: number, pageSize: number): T[] {
    const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  totalPages(totalItems: number, pageSize: number): number {
    if (!Number.isFinite(totalItems) || totalItems <= 0) {
      return 1;
    }

    return Math.max(1, Math.ceil(totalItems / pageSize));
  }

  pageNumbers(totalPages: number): number[] {
    const safeTotal = Number.isFinite(totalPages) && totalPages > 0 ? Math.floor(totalPages) : 1;
    return Array.from({ length: safeTotal }, (_, index) => index + 1);
  }

  clampPage(page: number, totalItems: number, pageSize: number): number {
    const maxPage = this.totalPages(totalItems, pageSize);

    if (!Number.isFinite(page) || page < 1) {
      return 1;
    }

    if (page > maxPage) {
      return maxPage;
    }

    return Math.floor(page);
  }
}
