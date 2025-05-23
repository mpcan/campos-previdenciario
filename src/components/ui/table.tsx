import * as React from "react"
import * as TablePrimitive from "@radix-ui/react-table"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Root>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <TablePrimitive.Root
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = TablePrimitive.Root.displayName

const TableHeader = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Header>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Header>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Header
    ref={ref}
    className={cn("bg-muted/50", className)}
    {...props}
  />
))
TableHeader.displayName = TablePrimitive.Header.displayName

const TableBody = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Body>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Body>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Body
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
TableBody.displayName = TablePrimitive.Body.displayName

const TableFooter = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Footer>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Footer>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Footer
    ref={ref}
    className={cn("bg-muted/50 font-medium", className)}
    {...props}
  />
))
TableFooter.displayName = TablePrimitive.Footer.displayName

const TableRow = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Row>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Row>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Row
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = TablePrimitive.Row.displayName

const TableHead = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Head>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Head>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Head
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = TablePrimitive.Head.displayName

const TableCell = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Cell>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Cell>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Cell
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = TablePrimitive.Cell.displayName

const TableCaption = React.forwardRef<
  React.ElementRef<typeof TablePrimitive.Caption>,
  React.ComponentPropsWithoutRef<typeof TablePrimitive.Caption>
>(({ className, ...props }, ref) => (
  <TablePrimitive.Caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = TablePrimitive.Caption.displayName

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
