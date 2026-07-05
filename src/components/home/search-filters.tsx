import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchFilters() {
  return (
    <section className="bg-white w-full  py-10">
      <div className="container mx-auto mt-12 bg-background p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <div className="flex flex-col h-full">
              <span className="text-xs font-medium text-muted-foreground mb-1">PROPERTY TYPE</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-muted text-accent-foreground">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent className="text-foreground bg-background">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="flex flex-col h-full">
              <span className="text-xs font-medium text-muted-foreground mb-1">LOCATION</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-muted text-accent-foreground">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="knoxville">Knoxville</SelectItem>
                  <SelectItem value="chattanooga">Chattanooga</SelectItem>
                  <SelectItem value="gatlinburg">Gatlinburg</SelectItem>
                  <SelectItem value="johnson-city">Johnson City</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="flex flex-col h-full">
              <span className="text-xs font-medium text-muted-foreground mb-1">PRICE</span>
              <Select defaultValue="all">
                <SelectTrigger className="w-full border-muted text-accent-foreground">
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="100k-300k">$100k - $300k</SelectItem>
                  <SelectItem value="300k-500k">$300k - $500k</SelectItem>
                  <SelectItem value="500k-750k">$500k - $750k</SelectItem>
                  <SelectItem value="750k-1m">$750k - $1M</SelectItem>
                  <SelectItem value="1m+">$1M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="flex flex-col h-full justify-end">
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
