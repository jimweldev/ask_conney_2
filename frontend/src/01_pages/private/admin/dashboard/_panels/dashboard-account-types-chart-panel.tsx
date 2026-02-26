import { useEffect, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Label, Pie, PieChart } from 'recharts';
import { chartColors } from '@/08_configs/chart-colors.config';
import PieChartSkeleton from '@/components/skeleton/pie-chart-skeleton';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import useTanstackQuery from '@/hooks/tanstack/use-tanstack-query';
import { type AccountType } from '../_types/account-type';

type ChartData = {
  account_type: string;
  count: number;
  fill: string;
};

// ✅ Reusable AnimatedNumber (motion-based)
const AnimatedNumber = ({
  value,
  duration = 1.2,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) => {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, latest =>
    Math.round(latest).toLocaleString(),
  );

  useEffect(() => {
    const controls = animate(motionValue, value || 0, {
      duration,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, duration, motionValue]);

  return <motion.tspan className={className}>{displayValue}</motion.tspan>;
};

// ✅ Main Component
const DashboardAccountTypesChartPanel = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { data, isFetching } = useTanstackQuery<AccountType[]>({
    endpoint: '/dashboard/account-types',
  });

  useEffect(() => {
    if (data) {
      setChartData(
        data.map((item: AccountType, index: number) => ({
          ...item,
          fill: chartColors[index % chartColors.length],
        })),
      );
    }
  }, [data]);

  const totalUsers = chartData.reduce((acc, curr) => acc + curr.count, 0);

  const chartConfig = chartData.reduce<
    Record<string, { label: string; color: string }>
  >((config, item, index) => {
    config[item.account_type] = {
      label: item.account_type,
      color: chartColors[index % chartColors.length],
    };
    return config;
  }, {});

  return (
    <Card className="col-span-12 @3xl/main:col-span-3">
      <CardBody className="h-full">
        <CardTitle>Account Types Chart</CardTitle>

        <div className="flex h-full items-center justify-center">
          <div className="w-full">
            {isFetching ? (
              <PieChartSkeleton />
            ) : (
              <ChartContainer
                config={chartConfig}
                className="mx-auto mt-auto aspect-[4/3] max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="account_type"
                    innerRadius={60}
                    strokeWidth={1}
                    label={({ name }) => name}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {/* ✅ Animated total number */}
                              <AnimatedNumber
                                value={totalUsers}
                                className="fill-foreground text-3xl font-bold"
                              />

                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Total Users
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DashboardAccountTypesChartPanel;
