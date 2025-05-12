"use client";

import { useState, useMemo } from "react";
import { VenueCard } from "@/components/venue-card";
import { AppLayout } from "@/components/app-layout";
import { Venue } from "@/app/actions/venues";
import { CityFilter } from "@/components/city-filter";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

interface VenuesClientPageProps {
  venues: Venue[];
}

export function VenuesClientPage({ venues }: VenuesClientPageProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 venues per page (3x3 grid)

  // Extract unique cities from venues
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    venues.forEach((venue) => {
      if (venue.city) {
        citySet.add(venue.city);
      }
    });
    return Array.from(citySet);
  }, [venues]);

  // Filter venues by selected city
  const filteredVenues = useMemo(() => {
    if (!selectedCity) return venues;
    return venues.filter((venue) => venue.city === selectedCity);
  }, [venues, selectedCity]);

  // Calculate pagination
  const totalVenues = filteredVenues.length;
  const totalPages = Math.ceil(totalVenues / itemsPerPage);
  
  // Get current page's venues
  const currentVenues = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredVenues.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredVenues, currentPage, itemsPerPage]);

  // Reset to page 1 when city changes
  useMemo(() => {
    setCurrentPage(1);
  }, [selectedCity]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers: (number | 'ellipsis')[] = [];
    
    if (totalPages <= 7) {
      // If 7 or fewer pages, show all page numbers
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Add ellipsis or page numbers
      if (currentPage <= 3) {
        pageNumbers.push(2, 3, 4, 5, 'ellipsis');
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pageNumbers.push('ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <AppLayout requireAuth={true}>
      <h1 className="text-3xl font-bold mb-6 font-serif">Lieux de Mariage</h1>
      <p className="text-muted-foreground mb-8">
        Trouvez le lieu parfait pour votre jour spécial. Parcourez notre sélection de lieux de mariage premium.
      </p>
      
      {/* City filter */}
      <CityFilter 
        cities={cities} 
        selectedCity={selectedCity} 
        onCityChange={setSelectedCity} 
      />
      
      {/* Display count of venues */}
      <p className="text-sm text-muted-foreground mb-4">
        {totalVenues} {totalVenues === 1 ? 'lieu trouvé' : 'lieux trouvés'}
        {selectedCity ? ` à ${selectedCity}` : ''}
      </p>
      
      {totalVenues > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            {currentVenues.map((venue) => (
              <VenueCard key={venue.id} {...venue} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="my-8">
              <PaginationContent>
                {/* Previous page button */}
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {/* Page numbers */}
                {getPageNumbers().map((pageNum, index) => (
                  pageNum === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        isActive={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                ))}
                
                {/* Next page button */}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <p className="text-center py-10">Aucun lieu trouvé. Veuillez réessayer plus tard.</p>
      )}
    </AppLayout>
  );
} 