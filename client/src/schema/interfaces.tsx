interface Page {
    pageNumber: number;
    imageUrl: string;
  }
  
export  interface ListPagesProps {
    pages: Page[];
    fileName: string;
  }
  